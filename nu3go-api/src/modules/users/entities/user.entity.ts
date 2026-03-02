import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true, nullable: true })
    phone: string;

    @Column({ name: 'password_hash' })
    passwordHash: string;

    @Column({ name: 'full_name' })
    fullName: string;

    @Column({
        default: 'customer',
        enum: ['super_admin', 'admin', 'kitchen_staff', 'delivery_manager', 'customer', 'corporate_admin'],
    })
    role: string;

    @Column({ name: 'is_verified', default: false })
    isVerified: boolean;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'delivery_address', nullable: true, type: 'text' })
    deliveryAddress: string;

    @Column({ name: 'delivery_area', nullable: true })
    deliveryArea: string;

    @Column({ name: 'delivery_notes', nullable: true, type: 'text' })
    deliveryNotes: string;

    @Column({ name: 'google_maps_link', nullable: true, type: 'text' })
    googleMapsLink: string;

    @Column({ name: 'corporate_account_id', nullable: true })
    corporateAccountId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
