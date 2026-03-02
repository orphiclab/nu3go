import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('locations')
export class Location {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column() name: string;
    @Column({ nullable: true }) address: string;
    @Column({ default: 'Colombo' }) city: string;
    @Column({ nullable: true }) area: string;
    @Column({ name: 'is_active', default: true }) isActive: boolean;
    @Column({ name: 'open_time', type: 'time', nullable: true }) openTime: string;
    @Column({ name: 'close_time', type: 'time', nullable: true }) closeTime: string;
    @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true }) lat: number;
    @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true }) lng: number;
    @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Injectable()
export class LocationsService {
    constructor(@InjectRepository(Location) private repo: Repository<Location>) { }

    findAll() { return this.repo.find({ where: { isActive: true }, order: { city: 'ASC', name: 'ASC' } }); }

    async findOne(id: string) {
        const l = await this.repo.findOne({ where: { id } });
        if (!l) throw new NotFoundException();
        return l;
    }

    create(dto: Partial<Location>) { return this.repo.save(this.repo.create(dto)); }

    async update(id: string, dto: Partial<Location>) {
        await this.repo.update(id, dto);
        return this.findOne(id);
    }
}

@Controller('locations')
export class LocationsController {
    constructor(private svc: LocationsService) { }

    @Get()
    findAll() { return this.svc.findAll(); }

    @Get(':id')
    findOne(@Param('id') id: string) { return this.svc.findOne(id); }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() body: any) { return this.svc.create(body); }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
}

@Module({
    imports: [TypeOrmModule.forFeature([Location])],
    controllers: [LocationsController],
    providers: [LocationsService],
    exports: [LocationsService],
})
export class LocationsModule { }
