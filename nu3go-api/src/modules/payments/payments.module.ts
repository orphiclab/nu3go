import { Module } from '@nestjs/common';
import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

// Payments are handled manually/externally (PayHere webhook stub).
// This module provides read endpoints only.

@Injectable()
export class PaymentsService {
    constructor(private readonly dataSource: DataSource) { }

    async getMyHistory(userId: string, limit = 20, page = 1) {
        const offset = (page - 1) * limit;
        const items = await this.dataSource.query(
            `SELECT * FROM payment_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset],
        );
        const [cnt] = await this.dataSource.query(
            `SELECT COUNT(*) FROM payment_transactions WHERE user_id = $1`,
            [userId],
        );
        return {
            data: { items },
            meta: { total: parseInt(cnt.count), page, limit },
        };
    }
}

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
    constructor(private svc: PaymentsService) { }

    @Get('my/history')
    getMyHistory(
        @Request() req: any,
        @Query('limit') limit = 20,
        @Query('page') page = 1,
    ) {
        return this.svc.getMyHistory(req.user.sub, +limit, +page);
    }
}

@Module({
    controllers: [PaymentsController],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule { }
