import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('plans')
export class Plan {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ enum: ['pickup', 'delivery', 'hybrid'] })
    type: string;

    @Column({ name: 'price_lkr', type: 'decimal', precision: 10, scale: 2 })
    priceLkr: number;

    @Column({ name: 'meal_count', nullable: true })
    mealCount: number;

    @Column({ name: 'billing_days', default: 30 })
    billingDays: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'jsonb', default: [] })
    features: string[];

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'is_corporate', default: false })
    isCorporate: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
