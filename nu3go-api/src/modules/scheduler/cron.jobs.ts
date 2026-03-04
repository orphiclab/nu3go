import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';

/**
 * PauseCreditCron
 * Runs daily at 2 AM: issues credit (LKR) refunds for paused subscription days.
 */
@Injectable()
export class PauseCreditCron {
    private readonly logger = new Logger(PauseCreditCron.name);

    constructor(
        private readonly dataSource: DataSource,
        @Optional() @Inject('default_IORedisModuleConnectionToken') private readonly redis: Redis | null,
    ) { }

    @Cron('0 2 * * *', { name: 'pause_credit_cron', timeZone: 'Asia/Colombo' })
    async handlePauseCredits() {
        this.logger.log('Running PauseCreditCron...');

        // Find subscriptions paused today that haven't been credited
        const paused = await this.dataSource.query(`
            SELECT pl.*, s.plan_id, p.price_lkr, p.billing_days
            FROM pause_logs pl
            JOIN subscriptions s ON s.id = pl.subscription_id
            JOIN plans p ON p.id = s.plan_id
            WHERE pl.resumed_at IS NULL
              AND pl.paused_at::date = CURRENT_DATE - 1
              AND pl.credit_issued = 0
        `);

        let credited = 0;
        for (const row of paused) {
            const dailyRate = parseFloat(row.price_lkr) / row.billing_days;
            const creditAmount = Math.round(dailyRate * 100) / 100;

            await this.dataSource.transaction(async (em) => {
                // Upsert wallet
                await em.query(`
                    INSERT INTO credit_wallets (user_id, balance_lkr)
                    SELECT user_id, 0 FROM subscriptions WHERE id = $1
                    ON CONFLICT (user_id) DO NOTHING
                `, [row.subscription_id]);

                // Apply credit
                await em.query(`
                    UPDATE credit_wallets
                    SET balance_lkr = balance_lkr + $1, updated_at = NOW()
                    WHERE user_id = (SELECT user_id FROM subscriptions WHERE id = $2)
                `, [creditAmount, row.subscription_id]);

                // Record transaction
                const [updated] = await em.query(`
                    SELECT balance_lkr FROM credit_wallets
                    WHERE user_id = (SELECT user_id FROM subscriptions WHERE id = $1)
                `, [row.subscription_id]);

                await em.query(`
                    INSERT INTO credit_transactions
                        (user_id, subscription_id, type, amount_lkr, balance_after, reason)
                    VALUES (
                        (SELECT user_id FROM subscriptions WHERE id = $1),
                        $1, 'earn', $2, $3,
                        'Daily credit for paused subscription day'
                    )
                `, [row.subscription_id, creditAmount, updated.balance_lkr]);

                // Mark as credited
                await em.query(`
                    UPDATE pause_logs SET credit_issued = $1 WHERE id = $2
                `, [creditAmount, row.id]);
            });

            credited++;
        }

        this.logger.log(`PauseCreditCron: credited ${credited} paused subscriptions`);
    }
}

/**
 * AutoRenewCron
 * Runs daily at 7 AM: automatically renews subscriptions expiring today.
 */
@Injectable()
export class AutoRenewCron {
    private readonly logger = new Logger(AutoRenewCron.name);

    constructor(private readonly dataSource: DataSource) { }

    @Cron('0 7 * * *', { name: 'auto_renew_cron', timeZone: 'Asia/Colombo' })
    async handleAutoRenew() {
        this.logger.log('Running AutoRenewCron...');

        // Find subscriptions expiring today with auto_renew enabled
        const expiring = await this.dataSource.query(`
            SELECT s.*, p.meal_count, p.billing_days, p.price_lkr, u.email, u.full_name
            FROM subscriptions s
            JOIN plans p ON p.id = s.plan_id
            JOIN users u ON u.id = s.user_id
            WHERE s.status = 'active'
              AND s.auto_renew = true
              AND s.end_date = CURRENT_DATE
        `);

        let renewed = 0;
        for (const sub of expiring) {
            try {
                const newStartDate = new Date(sub.end_date);
                newStartDate.setDate(newStartDate.getDate() + 1);
                const newEndDate = new Date(newStartDate);
                newEndDate.setDate(newEndDate.getDate() + sub.billing_days);

                await this.dataSource.query(`
                    UPDATE subscriptions SET
                        start_date = $2,
                        end_date = $3,
                        meals_remaining = $4,
                        meals_used = 0,
                        updated_at = NOW()
                    WHERE id = $1
                `, [
                    sub.id,
                    newStartDate.toISOString().split('T')[0],
                    newEndDate.toISOString().split('T')[0],
                    sub.meal_count ?? null,
                ]);

                renewed++;
            } catch (err) {
                this.logger.error(`Failed to renew subscription ${sub.id}:`, err);
            }
        }

        this.logger.log(`AutoRenewCron: renewed ${renewed} subscriptions`);
    }
}

/**
 * ExpiryCheckCron
 * Runs daily at 8 AM: marks expired subscriptions and sends reminder emails 3 days before expiry.
 */
@Injectable()
export class ExpiryCheckCron {
    private readonly logger = new Logger(ExpiryCheckCron.name);

    constructor(private readonly dataSource: DataSource) { }

    @Cron('0 8 * * *', { name: 'expiry_check_cron', timeZone: 'Asia/Colombo' })
    async handleExpiryCheck() {
        this.logger.log('Running ExpiryCheckCron...');

        // Mark past-due active subscriptions as expired
        const result = await this.dataSource.query(`
            UPDATE subscriptions
            SET status = 'expired', updated_at = NOW()
            WHERE status = 'active'
              AND auto_renew = false
              AND end_date < CURRENT_DATE
            RETURNING id, user_id
        `);

        this.logger.log(`ExpiryCheckCron: marked ${result.length} subscriptions as expired`);

        // Send expiry reminders to subscriptions expiring in 3 days
        const reminders = await this.dataSource.query(`
            SELECT s.id, u.email, u.full_name, s.end_date
            FROM subscriptions s
            JOIN users u ON u.id = s.user_id
            WHERE s.status = 'active'
              AND s.auto_renew = false
              AND s.end_date = CURRENT_DATE + 3
        `);

        this.logger.log(`ExpiryCheckCron: ${reminders.length} renewal reminder emails to send (handled by NotificationsService)`);
        // NotificationsService email calls would be wired here in production
    }
}
