import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';

@Entity('meal_logs')
export class MealLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'subscription_id' })
    subscriptionId: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'location_id', nullable: true })
    locationId: string;

    @Column({ enum: ['pickup', 'delivery'] })
    type: string;

    @Column({ enum: ['nfc', 'qr', 'manual', 'delivery'] })
    method: string;

    @Column({ name: 'meal_date', type: 'date' })
    mealDate: Date;

    @Column({ name: 'confirmed_at', type: 'timestamptz', default: () => 'NOW()' })
    confirmedAt: Date;

    @Column({ name: 'is_voided', default: false })
    isVoided: boolean;

    @Column({ name: 'voided_by', nullable: true })
    voidedBy: string;

    @Column({ name: 'void_reason', nullable: true })
    voidReason: string;
}
