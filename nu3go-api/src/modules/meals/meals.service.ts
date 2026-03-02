import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MealLog } from './entities/meal-log.entity';

@Injectable()
export class MealsService {
    constructor(
        @InjectRepository(MealLog)
        private readonly mealRepo: Repository<MealLog>,
        private readonly dataSource: DataSource,
    ) { }

    async getMyHistory(userId: string, limit = 20, page = 1) {
        const offset = (page - 1) * limit;
        const [items, total] = await this.mealRepo.findAndCount({
            where: { userId, isVoided: false },
            order: { mealDate: 'DESC' },
            take: limit,
            skip: offset,
        });
        return { items, meta: { total, page, limit } };
    }

    async getMyRemaining(userId: string) {
        const result = await this.dataSource.query(
            `SELECT meals_remaining, meals_used
       FROM subscriptions
       WHERE user_id = $1 AND status = 'active'
       LIMIT 1`,
            [userId],
        );
        if (!result.length) return { mealsRemaining: 0, mealsUsed: 0 };
        return {
            mealsRemaining: result[0].meals_remaining,
            mealsUsed: result[0].meals_used,
        };
    }

    async getAdminLogs(
        date: string,
        page = 1,
        limit = 25,
        search?: string,
    ) {
        const offset = (page - 1) * limit;
        const searchClause = search
            ? `AND (u.full_name ILIKE $4 OR u.email ILIKE $4)`
            : '';
        const params: any[] = [date, limit, offset];
        if (search) params.push(`%${search}%`);

        const items = await this.dataSource.query(
            `SELECT ml.*, u.full_name as user_name, l.name as location_name
       FROM meal_logs ml
       JOIN users u ON u.id = ml.user_id
       LEFT JOIN locations l ON l.id = ml.location_id
       WHERE ml.meal_date = $1 ${searchClause}
       ORDER BY ml.confirmed_at DESC
       LIMIT $2 OFFSET $3`,
            params,
        );

        const countResult = await this.dataSource.query(
            `SELECT COUNT(*) FROM meal_logs ml
       JOIN users u ON u.id = ml.user_id
       WHERE ml.meal_date = $1 ${searchClause}`,
            search ? [date, `%${search}%`] : [date],
        );

        return {
            data: { items },
            meta: { total: parseInt(countResult[0].count), page, limit },
        };
    }

    async voidLog(logId: string, adminId: string, reason: string) {
        await this.dataSource.transaction(async (em) => {
            const [log] = await em.query(
                `SELECT * FROM meal_logs WHERE id = $1 FOR UPDATE`,
                [logId],
            );
            if (!log || log.is_voided) throw new Error('Already voided or not found');

            await em.query(
                `UPDATE meal_logs SET is_voided = true, voided_by = $2, void_reason = $3 WHERE id = $1`,
                [logId, adminId, reason],
            );
            // Restore the meal count
            await em.query(
                `UPDATE subscriptions
         SET meals_remaining = meals_remaining + 1, meals_used = meals_used - 1
         WHERE id = $1 AND meals_remaining IS NOT NULL`,
                [log.subscription_id],
            );
        });
        return { message: 'Meal log voided and meal count restored.' };
    }
}
