import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('credit_wallets')
export class CreditWallet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', unique: true })
    userId: string;

    @Column({ name: 'balance_lkr', type: 'decimal', precision: 10, scale: 2, default: 0 })
    balanceLkr: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

@Entity('credit_transactions')
export class CreditTransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'subscription_id', nullable: true })
    subscriptionId: string;

    @Column({ enum: ['earn', 'redeem', 'expire', 'holiday', 'admin_adjustment'] })
    type: string;

    @Column({ name: 'amount_lkr', type: 'decimal', precision: 10, scale: 2 })
    amountLkr: number;

    @Column({ name: 'balance_after', type: 'decimal', precision: 10, scale: 2 })
    balanceAfter: number;

    @Column({ nullable: true })
    reason: string;

    @Column({ name: 'reference_id', nullable: true })
    referenceId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
