import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreditWallet, CreditTransaction } from './entities/credit.entity';

@Injectable()
export class CreditsService {
    constructor(
        @InjectRepository(CreditWallet)
        private readonly walletRepo: Repository<CreditWallet>,
        @InjectRepository(CreditTransaction)
        private readonly txRepo: Repository<CreditTransaction>,
        private readonly dataSource: DataSource,
    ) { }

    async getBalance(userId: string) {
        let wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet) {
            wallet = await this.walletRepo.save(this.walletRepo.create({ userId, balanceLkr: 0 }));
        }
        return wallet;
    }

    async getHistory(userId: string, limit = 20, page = 1) {
        const offset = (page - 1) * limit;
        const [items, total] = await this.txRepo.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
        return { items, meta: { total, page, limit } };
    }

    async adminAdjust(userId: string, amountLkr: number, reason: string) {
        await this.dataSource.transaction(async (em) => {
            let wallet = await em.findOne(CreditWallet, { where: { userId } });
            if (!wallet) {
                wallet = em.create(CreditWallet, { userId, balanceLkr: 0 });
                await em.save(wallet);
            }

            const newBalance = Number(wallet.balanceLkr) + amountLkr;

            await em.update(CreditWallet, { userId }, { balanceLkr: newBalance });

            await em.save(
                em.create(CreditTransaction, {
                    userId,
                    type: 'admin_adjustment',
                    amountLkr,
                    balanceAfter: newBalance,
                    reason,
                }),
            );
        });
        return { message: 'Adjustment applied.' };
    }

    async getAdminHistory(search?: string, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const searchClause = search ? `WHERE u.full_name ILIKE $3 OR u.email ILIKE $3` : '';
        const params: any[] = [limit, offset];
        if (search) params.push(`%${search}%`);

        const items = await this.dataSource.query(
            `SELECT ct.*, u.full_name as user_name
       FROM credit_transactions ct
       JOIN users u ON u.id = ct.user_id
       ${searchClause}
       ORDER BY ct.created_at DESC
       LIMIT $1 OFFSET $2`,
            params,
        );

        const [countResult] = await this.dataSource.query(
            `SELECT COUNT(*) FROM credit_transactions ct JOIN users u ON u.id = ct.user_id ${searchClause}`,
            search ? [`%${search}%`] : [],
        );

        return {
            data: { items },
            meta: { total: parseInt(countResult.count), page, limit },
        };
    }
}
