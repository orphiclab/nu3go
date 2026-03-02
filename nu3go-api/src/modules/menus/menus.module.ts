import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('menu_items')
export class MenuItem {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column() name: string;
    @Column({ nullable: true }) description: string;
    @Column({ name: 'image_url', nullable: true }) imageUrl: string;
    @Column({ nullable: true }) calories: number;
    @Column({ type: 'jsonb', default: [] }) tags: string[];
    @Column({ name: 'is_active', default: true }) isActive: boolean;
    @Column({ name: 'valid_from', nullable: true, type: 'date' }) validFrom: string;
    @Column({ name: 'valid_to', nullable: true, type: 'date' }) validTo: string;
    @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Injectable()
export class MenusService {
    constructor(@InjectRepository(MenuItem) private repo: Repository<MenuItem>) { }

    findAll(limit = 50, page = 1) {
        return this.repo.findAndCount({
            order: { createdAt: 'DESC' },
            take: limit,
            skip: (page - 1) * limit,
        }).then(([items, total]) => ({
            data: { items },
            meta: { total, page, limit },
        }));
    }

    async findOne(id: string) {
        const item = await this.repo.findOne({ where: { id } });
        if (!item) throw new NotFoundException();
        return item;
    }

    create(dto: Partial<MenuItem>) { return this.repo.save(this.repo.create(dto)); }

    async update(id: string, dto: Partial<MenuItem>) {
        await this.repo.update(id, dto);
        return this.findOne(id);
    }

    async remove(id: string) {
        await this.repo.update(id, { isActive: false });
        return { message: 'Deleted.' };
    }
}

@Controller('menus')
@UseGuards(AuthGuard('jwt'))
export class MenusController {
    constructor(private svc: MenusService) { }

    @Get()
    findAll(@Query('limit') limit = 50, @Query('page') page = 1) {
        return this.svc.findAll(+limit, +page);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.svc.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin', 'super_admin')
    create(@Body() body: any) {
        return this.svc.create(body);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super_admin')
    update(@Param('id') id: string, @Body() body: any) {
        return this.svc.update(id, body);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super_admin')
    remove(@Param('id') id: string) {
        return this.svc.remove(id);
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([MenuItem])],
    controllers: [MenusController],
    providers: [MenusService],
    exports: [MenusService],
})
export class MenusModule { }
