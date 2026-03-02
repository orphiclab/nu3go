import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Entity('nfc_cards')
export class NfcCard {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ name: 'card_uid', unique: true }) cardUid: string;
    @Column({ name: 'user_id', nullable: true }) userId: string;
    @Column({ name: 'secret_hash' }) secretHash: string;
    @Column({ name: 'is_active', default: true }) isActive: boolean;
    @Column({ nullable: true }) label: string;
    @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Injectable()
export class NfcService {
    constructor(
        @InjectRepository(NfcCard)
        private readonly repo: Repository<NfcCard>,
        private readonly dataSource: DataSource,
    ) { }

    findAll() {
        return this.repo.find({ order: { createdAt: 'DESC' } });
    }

    async findOne(id: string) {
        const card = await this.repo.findOne({ where: { id } });
        if (!card) throw new NotFoundException();
        return card;
    }

    async create(dto: { cardUid: string; label?: string }) {
        const secretHash = require('crypto').randomBytes(32).toString('hex');
        return this.repo.save(
            this.repo.create({ cardUid: dto.cardUid, label: dto.label, secretHash }),
        );
    }

    async assignToUser(cardId: string, userId: string) {
        const card = await this.findOne(cardId);
        await this.dataSource.transaction(async (em) => {
            // Unassign any existing card for this user
            await em.update(NfcCard, { userId }, { userId: null as any });
            // Assign new card
            await em.update(NfcCard, { id: cardId }, { userId, isActive: true });
            // Optionally write card UID to user record
            await em.query(
                `UPDATE users SET nfc_card_uid = $1 WHERE id = $2`,
                [card.cardUid, userId],
            );
        });
        return { message: 'NFC card assigned.' };
    }

    async unassign(cardId: string) {
        const card = await this.findOne(cardId);
        await this.dataSource.transaction(async (em) => {
            await em.update(NfcCard, { id: cardId }, { userId: null as any });
            if (card.userId) {
                await em.query(`UPDATE users SET nfc_card_uid = NULL WHERE id = $1`, [card.userId]);
            }
        });
        return { message: 'NFC card unassigned.' };
    }

    async deactivate(cardId: string) {
        await this.repo.update(cardId, { isActive: false });
        return { message: 'NFC card deactivated.' };
    }

    async getCardForUser(userId: string) {
        return this.repo.findOne({ where: { userId, isActive: true } });
    }
}

@Controller('nfc')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin', 'super_admin')
export class NfcController {
    constructor(private readonly svc: NfcService) { }

    @Get('cards')
    findAll() { return this.svc.findAll(); }

    @Get('cards/:id')
    findOne(@Param('id') id: string) { return this.svc.findOne(id); }

    @Post('cards')
    create(@Body() body: { cardUid: string; label?: string }) {
        return this.svc.create(body);
    }

    @Post('cards/:id/assign')
    assign(@Param('id') id: string, @Body() body: { userId: string }) {
        return this.svc.assignToUser(id, body.userId);
    }

    @Post('cards/:id/unassign')
    unassign(@Param('id') id: string) {
        return this.svc.unassign(id);
    }

    @Delete('cards/:id')
    deactivate(@Param('id') id: string) {
        return this.svc.deactivate(id);
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([NfcCard])],
    controllers: [NfcController],
    providers: [NfcService],
    exports: [NfcService],
})
export class NfcModule { }
