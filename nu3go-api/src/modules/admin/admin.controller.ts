import {
    Controller, Get, Patch, Post, Delete, Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreditsService } from '../credits/credits.service';
import { MealsService } from '../meals/meals.service';
import { ReportsService } from '../reports/reports.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin', 'super_admin')
@Controller('admin')
export class AdminController {
    constructor(
        private readonly dataSource: DataSource,
        private readonly creditsService: CreditsService,
        private readonly mealsService: MealsService,
        private readonly reportsService: ReportsService,
    ) { }

    // ─── Users ─────────────────────────────────────────────────────────────────

    @Get('users')
    async getUsers(
        @Query('search') search = '',
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {
        const offset = (+page - 1) * +limit;
        const searchClause = search ? `WHERE u.full_name ILIKE $3 OR u.email ILIKE $3` : '';
        const params: any[] = [+limit, offset];
        if (search) params.push(`%${search}%`);

        const items = await this.dataSource.query(
            `SELECT id, email, full_name, phone, role, is_active, is_verified, created_at
       FROM users u ${searchClause}
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            params,
        );

        const [countResult] = await this.dataSource.query(
            `SELECT COUNT(*) FROM users u ${searchClause}`,
            search ? [`%${search}%`] : [],
        );

        return { data: { items }, meta: { total: parseInt(countResult.count), page: +page, limit: +limit } };
    }

    @Patch('users/:id')
    async updateUser(@Param('id') id: string, @Body() body: any) {
        const allowedFields = ['is_active', 'role', 'full_name', 'phone'];
        const updates: string[] = [];
        const vals: any[] = [];

        Object.entries(body).forEach(([key, val]) => {
            const col = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            if (allowedFields.includes(col)) {
                vals.push(val);
                updates.push(`${col} = $${vals.length}`);
            }
        });

        if (!updates.length) return { message: 'Nothing to update.' };
        vals.push(id);
        await this.dataSource.query(
            `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${vals.length}`,
            vals,
        );
        return { message: 'User updated.' };
    }

    // ─── Subscriptions ─────────────────────────────────────────────────────────

    @Get('subscriptions')
    async getSubscriptions(
        @Query('search') search = '',
        @Query('status') status = '',
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {
        const offset = (+page - 1) * +limit;
        const conditions: string[] = [];
        const params: any[] = [+limit, offset];

        if (status) { params.push(status); conditions.push(`s.status = $${params.length}`); }
        if (search) { params.push(`%${search}%`); conditions.push(`(u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`); }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const items = await this.dataSource.query(
            `SELECT s.*, u.full_name as user_name, u.email as user_email, p.name as plan_name
       FROM subscriptions s
       JOIN users u ON u.id = s.user_id
       JOIN plans p ON p.id = s.plan_id
       ${where}
       ORDER BY s.created_at DESC LIMIT $1 OFFSET $2`,
            params,
        );

        const [cnt] = await this.dataSource.query(
            `SELECT COUNT(*) FROM subscriptions s JOIN users u ON u.id = s.user_id ${where}`,
            params.slice(2),
        );

        return { data: { items }, meta: { total: parseInt(cnt.count), page: +page, limit: +limit } };
    }

    // ─── Meal Logs ─────────────────────────────────────────────────────────────

    @Get('meal-logs')
    getMealLogs(
        @Query('date') date: string,
        @Query('search') search: string,
        @Query('page') page = 1,
        @Query('limit') limit = 25,
    ) {
        return this.mealsService.getAdminLogs(
            date ?? new Date().toISOString().split('T')[0],
            +page, +limit, search,
        );
    }

    @Post('meal-logs/:id/void')
    voidMealLog(@Param('id') id: string, @Request() req: any, @Body() body: { reason: string }) {
        return this.mealsService.voidLog(id, req.user.sub, body.reason);
    }

    // ─── Credits ───────────────────────────────────────────────────────────────

    @Get('credits')
    getCredits(@Query('search') search: string, @Query('page') page = 1, @Query('limit') limit = 20) {
        return this.creditsService.getAdminHistory(search, +page, +limit);
    }

    @Post('credits/adjust')
    adjustCredit(@Body() body: { userId: string; amountLkr: number; reason: string }) {
        return this.creditsService.adminAdjust(body.userId, body.amountLkr, body.reason);
    }

    // ─── Overview KPIs ─────────────────────────────────────────────────────────

    @Get('overview')
    getOverview() {
        return this.reportsService.getDashboard();
    }
}
