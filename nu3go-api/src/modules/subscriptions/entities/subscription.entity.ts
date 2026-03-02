import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('subscriptions')
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'plan_id' })
    planId: string;

    @Column({ name: 'location_id', nullable: true })
    locationId: string;

    @Column({
        default: 'active',
        enum: ['active', 'paused', 'expired', 'cancelled', 'pending'],
    })
    status: string;

    @Column({ enum: ['pickup', 'delivery', 'hybrid'] })
    type: string;

    @Column({ name: 'start_date', type: 'date' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date' })
    endDate: Date;

    @Column({ name: 'next_billing_date', type: 'date', nullable: true })
    nextBillingDate: Date;

    @Column({
        name: 'start_day',
        nullable: true,
        enum: ['monday', 'thursday'],
    })
    startDay: string;

    @Column({ name: 'meals_remaining', nullable: true })
    mealsRemaining: number;

    @Column({ name: 'meals_used', default: 0 })
    mealsUsed: number;

    @Column({ name: 'auto_renew', default: true })
    autoRenew: boolean;

    @Column({ name: 'paused_at', type: 'timestamptz', nullable: true })
    pausedAt: Date;

    @Column({ name: 'pause_reason', nullable: true, type: 'text' })
    pauseReason: string;

    @Column({ name: 'corporate_account_id', nullable: true })
    corporateAccountId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
