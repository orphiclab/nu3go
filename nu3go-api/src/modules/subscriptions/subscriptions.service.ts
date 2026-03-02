import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionsService {
    constructor(
        @InjectRepository(Subscription)
        private readonly subRepo: Repository<Subscription>,
        private readonly dataSource: DataSource,
    ) { }

    async getMy(userId: string) {
        const sub = await this.dataSource.query(
            `SELECT s.*,
              p.name as plan_name, p.type as plan_type,
              p.price_lkr, p.meal_count, p.billing_days, p.features,
              l.name as location_name
       FROM subscriptions s
       JOIN plans p ON p.id = s.plan_id
       LEFT JOIN locations l ON l.id = s.location_id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC
       LIMIT 1`,
            [userId],
        );

        if (!sub.length) return null;
        const s = sub[0];
        return {
            ...s,
            plan: {
                id: s.plan_id,
                name: s.plan_name,
                type: s.plan_type,
                priceLkr: s.price_lkr,
                mealCount: s.meal_count,
                billingDays: s.billing_days,
                features: s.features ?? [],
            },
        };
    }

    async create(userId: string, dto: { planId: string; locationId?: string; startDay?: string }) {
        // Check for existing active subscription
        const existing = await this.subRepo.findOne({
            where: { userId, status: 'active' } as any,
        });
        if (existing) {
            throw new ConflictException({
                code: 'ACTIVE_SUBSCRIPTION_EXISTS',
                message: 'You already have an active subscription.',
            });
        }

        // Fetch plan details
        const plan = await this.dataSource.query(
            `SELECT * FROM plans WHERE id = $1 AND is_active = true`,
            [dto.planId],
        );
        if (!plan.length) throw new NotFoundException({ code: 'PLAN_NOT_FOUND' });

        const p = plan[0];
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + p.billing_days);

        const sub = this.subRepo.create({
            userId,
            planId: dto.planId,
            locationId: dto.locationId,
            status: 'pending',
            type: p.type,
            startDate: today,
            endDate,
            startDay: dto.startDay as any,
            mealsRemaining: p.meal_count ?? null,
            mealsUsed: 0,
            autoRenew: true,
        });

        return this.subRepo.save(sub);
    }

    async changePlan(userId: string, planId: string) {
        const sub = await this.getActiveOrThrow(userId);
        const plan = await this.dataSource.query(
            `SELECT * FROM plans WHERE id = $1 AND is_active = true`,
            [planId],
        );
        if (!plan.length) throw new NotFoundException({ code: 'PLAN_NOT_FOUND' });

        await this.subRepo.update(sub.id, {
            planId,
            type: plan[0].type,
            mealsRemaining: plan[0].meal_count ?? null,
        } as any);

        return this.getMy(userId);
    }

    async pause(userId: string, reason?: string) {
        const sub = await this.getActiveOrThrow(userId);
        if (sub.status === 'paused') {
            throw new BadRequestException({ code: 'ALREADY_PAUSED', message: 'Subscription is already paused.' });
        }

        await this.dataSource.transaction(async (em) => {
            await em.query(
                `UPDATE subscriptions SET status = 'paused', paused_at = NOW(), pause_reason = $2 WHERE id = $1`,
                [sub.id, reason],
            );
            await em.query(
                `INSERT INTO pause_logs (subscription_id, user_id, paused_at, reason) VALUES ($1, $2, NOW(), $3)`,
                [sub.id, userId, reason],
            );
        });

        return this.getMy(userId);
    }

    async resume(userId: string) {
        const sub = await this.subRepo.findOne({ where: { userId, status: 'paused' } as any });
        if (!sub) throw new NotFoundException({ code: 'NO_PAUSED_SUBSCRIPTION' });

        await this.dataSource.transaction(async (em) => {
            await em.query(
                `UPDATE subscriptions SET status = 'active', paused_at = NULL WHERE id = $1`,
                [sub.id],
            );
            await em.query(
                `UPDATE pause_logs SET resumed_at = NOW() WHERE subscription_id = $1 AND resumed_at IS NULL`,
                [sub.id],
            );
        });

        return this.getMy(userId);
    }

    async cancel(userId: string, reason?: string) {
        const sub = await this.getActiveOrThrow(userId);
        await this.subRepo.update(sub.id, { status: 'cancelled' } as any);
        return { message: 'Subscription cancelled.' };
    }

    async toggleAutoRenew(userId: string, autoRenew: boolean) {
        const sub = await this.getActiveOrThrow(userId);
        await this.subRepo.update(sub.id, { autoRenew });
        return { autoRenew };
    }

    private async getActiveOrThrow(userId: string) {
        const sub = await this.subRepo.findOne({
            where: { userId, status: 'active' } as any,
        });
        if (!sub) throw new NotFoundException({
            code: 'NO_ACTIVE_SUBSCRIPTION',
            message: 'No active subscription found.',
        });
        return sub;
    }
}
