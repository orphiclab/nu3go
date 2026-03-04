import {
    Injectable,
    NotFoundException,
    ConflictException,
    UnauthorizedException,
    ForbiddenException,
    Optional,
    Inject,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import Redis from 'ioredis';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

/**
 * PickupService — handles all NFC + QR meal pickup validation.
 *
 * Business rules enforced here:
 *  1. One pickup per subscription per calendar day (unique index + Redis lock)
 *  2. Subscription must be ACTIVE (not paused/expired/cancelled)
 *  3. NFC token must be HMAC-SHA256 signed with the card's secret
 *  4. QR tokens are single-use, time-limited JWTs
 *  5. Meal deduction is wrapped in a DB transaction (atomic)
 *  6. For hybrid plans, mealsRemaining must be > 0
 */
@Injectable()
export class PickupService {
    private readonly logger = new Logger(PickupService.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly jwtService: JwtService,
        @Optional() @Inject('default_IORedisModuleConnectionToken') private readonly redis: Redis | null,
    ) {
        if (!this.redis) {
            this.logger.warn('Redis not available — distributed locks disabled, using DB-only dedup');
        }
    }

    // ─── NFC Validation ─────────────────────────────────────────
    async validateNfc(token: string): Promise<{
        userName: string;
        planName: string;
        mealsRemaining?: number;
        location: string;
        message: string;
    }> {
        // 1. Decode and verify the HMAC-signed token
        let payload: { userId: string; cardUid: string; ts: number };
        try {
            const decoded = Buffer.from(token, 'base64url').toString('utf8');
            payload = JSON.parse(decoded);
        } catch {
            throw new UnauthorizedException({
                code: 'INVALID_NFC_TOKEN',
                message: 'NFC token is invalid.',
            });
        }

        const { userId, cardUid, ts } = payload;

        // 2. Token must not be older than 60 seconds (prevent replay attacks)
        const now = Math.floor(Date.now() / 1000);
        if (now - ts > 60) {
            throw new UnauthorizedException({
                code: 'INVALID_NFC_TOKEN',
                message: 'NFC token has expired. Please tap again.',
            });
        }

        // 3. Look up NFC card (raw query for performance)
        const card = await this.dataSource.query(
            `SELECT nc.*, u.full_name, u.id as user_id
       FROM nfc_cards nc
       JOIN users u ON u.id = nc.user_id
       WHERE nc.card_uid = $1 AND nc.is_active = true AND u.id = $2`,
            [cardUid, userId],
        );

        if (!card.length) {
            throw new UnauthorizedException({
                code: 'INVALID_NFC_TOKEN',
                message: 'NFC card not found or inactive.',
            });
        }

        // 4. Verify HMAC signature
        const expectedSig = crypto
            .createHmac('sha256', card[0].secret_hash)
            .update(`${userId}:${cardUid}:${ts}`)
            .digest('hex');

        const providedSig = payload['sig'];
        if (!providedSig || !crypto.timingSafeEqual(
            Buffer.from(expectedSig),
            Buffer.from(providedSig, 'hex')
        )) {
            throw new UnauthorizedException({
                code: 'INVALID_NFC_TOKEN',
                message: 'NFC signature invalid.',
            });
        }

        // 5. Proceed to deduct meal
        return this.deductMeal(userId, 'nfc', card[0].full_name);
    }

    // ─── QR Code Generation ──────────────────────────────────────
    async generateQrToken(userId: string): Promise<{ token: string; expiresAt: string }> {
        // Short-lived JWT for QR
        const token = this.jwtService.sign(
            { sub: userId, type: 'qr_pickup' },
            { expiresIn: '5m' },
        );

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        // Store in DB as pending (handled by QR service)
        await this.dataSource.query(
            `INSERT INTO qr_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET token = $2, expires_at = $3, is_used = false`,
            [userId, token, expiresAt],
        );

        return { token, expiresAt };
    }

    // ─── QR Validation ───────────────────────────────────────────
    async validateQr(token: string): Promise<{
        userName: string;
        planName: string;
        mealsRemaining?: number;
        location: string;
        message: string;
    }> {
        // 1. Verify JWT signature
        let payload: { sub: string; type: string };
        try {
            payload = this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException({
                code: 'INVALID_QR_TOKEN',
                message: 'QR code has expired. Please refresh.',
            });
        }

        if (payload.type !== 'qr_pickup') {
            throw new UnauthorizedException({ code: 'INVALID_QR_TOKEN', message: 'Invalid QR type.' });
        }

        // 2. Check if already used (atomic in DB)
        const result = await this.dataSource.query(
            `UPDATE qr_tokens
       SET is_used = true, used_at = NOW()
       WHERE token = $1 AND is_used = false AND expires_at > NOW()
       RETURNING user_id`,
            [token],
        );

        if (!result.length) {
            throw new ConflictException({
                code: 'QR_ALREADY_USED',
                message: 'This QR code has already been used or has expired.',
            });
        }

        const userId = result[0].user_id;

        // 3. Fetch user name
        const user = await this.dataSource.query(
            `SELECT full_name FROM users WHERE id = $1`,
            [userId],
        );

        return this.deductMeal(userId, 'qr', user[0]?.full_name ?? 'Customer');
    }

    // ─── Core Meal Deduction (used by both NFC and QR) ──────────
    private async deductMeal(
        userId: string,
        method: 'nfc' | 'qr',
        userName: string,
    ): Promise<{
        userName: string;
        planName: string;
        mealsRemaining?: number;
        location: string;
        message: string;
    }> {
        const today = new Date().toISOString().split('T')[0];
        const lockKey = `meal_lock:${userId}:${today}`;

        // ─── Redis distributed lock (SETNX pattern) ────
        // When Redis is unavailable, skip the lock and rely on DB unique constraint
        if (this.redis) {
            const lockAcquired = await this.redis.set(lockKey, '1', 'EX', 30, 'NX');
            if (!lockAcquired) {
                throw new ConflictException({
                    code: 'MEAL_ALREADY_USED',
                    message: 'You have already picked up your meal today.',
                });
            }
        }

        try {
            // Start DB transaction
            const result = await this.dataSource.transaction(async (em) => {
                // 1. Get active subscription
                const subs = await em.query(
                    `SELECT s.*, p.name as plan_name, p.type as plan_type,
                  l.name as location_name
           FROM subscriptions s
           JOIN plans p ON p.id = s.plan_id
           LEFT JOIN locations l ON l.id = s.location_id
           WHERE s.user_id = $1
             AND s.status = 'active'
             AND s.end_date >= CURRENT_DATE
           LIMIT 1`,
                    [userId],
                );

                if (!subs.length) {
                    throw new ForbiddenException({
                        code: 'SUBSCRIPTION_EXPIRED',
                        message: 'No active subscription found.',
                    });
                }

                const sub = subs[0];

                // 2. Check daily uniqueness (DB constraint will also catch this)
                const existing = await em.query(
                    `SELECT id FROM meal_logs
           WHERE subscription_id = $1 AND meal_date = $2 AND NOT is_voided`,
                    [sub.id, today],
                );

                if (existing.length) {
                    throw new ConflictException({
                        code: 'MEAL_ALREADY_USED',
                        message: 'You have already picked up your meal today.',
                    });
                }

                // 3. For hybrid plans, check meal count
                if (sub.plan_type === 'hybrid') {
                    if (sub.meals_remaining <= 0) {
                        throw new ForbiddenException({
                            code: 'NO_MEALS_REMAINING',
                            message: 'No meals remaining in your current cycle.',
                        });
                    }
                    // Deduct meal
                    await em.query(
                        `UPDATE subscriptions
             SET meals_remaining = meals_remaining - 1,
                 meals_used = meals_used + 1,
                 updated_at = NOW()
             WHERE id = $1`,
                        [sub.id],
                    );
                }

                // 4. Log the pickup
                await em.query(
                    `INSERT INTO meal_logs (subscription_id, user_id, location_id, type, method, meal_date)
           VALUES ($1, $2, $3, 'pickup', $4, $5)`,
                    [sub.id, userId, sub.location_id, method, today],
                );

                return {
                    planName: sub.plan_name,
                    mealsRemaining:
                        sub.plan_type === 'hybrid' ? sub.meals_remaining - 1 : undefined,
                    location: sub.location_name ?? 'nu3go',
                };
            });

            return {
                userName,
                planName: result.planName,
                mealsRemaining: result.mealsRemaining,
                location: result.location,
                message: 'Enjoy your breakfast! ✓',
            };
        } finally {
            // Always release the lock (if Redis available)
            if (this.redis) {
                await this.redis.del(lockKey);
            }
        }
    }
}
