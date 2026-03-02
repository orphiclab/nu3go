import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';

@Injectable()
export class PlansService {
    constructor(
        @InjectRepository(Plan)
        private readonly planRepo: Repository<Plan>,
    ) { }

    findAll(corporateOnly = false) {
        return this.planRepo.find({
            where: { isActive: true, ...(corporateOnly ? { isCorporate: true } : {}) },
            order: { priceLkr: 'ASC' },
        });
    }

    async findOne(id: string) {
        const plan = await this.planRepo.findOne({ where: { id } });
        if (!plan) throw new NotFoundException({ code: 'PLAN_NOT_FOUND' });
        return plan;
    }

    create(dto: Partial<Plan>) {
        const plan = this.planRepo.create(dto);
        return this.planRepo.save(plan);
    }

    async update(id: string, dto: Partial<Plan>) {
        await this.findOne(id);
        await this.planRepo.update(id, dto);
        return this.findOne(id);
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.planRepo.update(id, { isActive: false });
        return { message: 'Plan deactivated.' };
    }
}
