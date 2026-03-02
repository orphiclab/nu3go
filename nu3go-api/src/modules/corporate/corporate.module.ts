import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Entity('corporate_accounts')
export class CorporateAccount {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ name: 'company_name' }) companyName: string;
    @Column({ name: 'contact_person' }) contactPerson: string;
    @Column({ name: 'contact_email' }) contactEmail: string;
    @Column({ nullable: true }) city: string;
    @Column({ name: 'is_active', default: true }) isActive: boolean;
    @Column({ name: 'total_paid_lkr', type: 'decimal', precision: 12, scale: 2, default: 0 }) totalPaidLkr: number;
    @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Injectable()
export class CorporateService {
    constructor(@InjectRepository(CorporateAccount) private repo: Repository<CorporateAccount>) { }

    findAll(limit = 50, page = 1) {
        return this.repo.findAndCount({
            order: { createdAt: 'DESC' },
            take: limit,
            skip: (page - 1) * limit,
        }).then(([items, total]) => ({ data: { items }, meta: { total, page, limit } }));
    }

    async findOne(id: string) {
        const a = await this.repo.findOne({ where: { id } });
        if (!a) throw new NotFoundException();
        return a;
    }

    create(dto: Partial<CorporateAccount>) { return this.repo.save(this.repo.create(dto)); }

    async update(id: string, dto: Partial<CorporateAccount>) {
        await this.repo.update(id, dto);
        return this.findOne(id);
    }
}

@Controller('corporate')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin', 'super_admin')
export class CorporateController {
    constructor(private svc: CorporateService) { }

    @Get('accounts')
    findAll(@Query('limit') limit = 50, @Query('page') page = 1) {
        return this.svc.findAll(+limit, +page);
    }

    @Get('accounts/:id')
    findOne(@Param('id') id: string) { return this.svc.findOne(id); }

    @Post('accounts')
    create(@Body() body: any) { return this.svc.create(body); }

    @Patch('accounts/:id')
    update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
}

@Module({
    imports: [TypeOrmModule.forFeature([CorporateAccount])],
    controllers: [CorporateController],
    providers: [CorporateService],
    exports: [CorporateService],
})
export class CorporateModule { }
