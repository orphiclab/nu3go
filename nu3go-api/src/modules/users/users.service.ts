import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    async findById(id: string) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) throw new NotFoundException({ code: 'USER_NOT_FOUND' });
        return user;
    }

    async updateMe(id: string, dto: Partial<{
        fullName: string;
        phone: string;
        deliveryAddress: string;
        deliveryArea: string;
        deliveryNotes: string;
    }>) {
        await this.userRepo.update(id, dto as any);
        return this.findById(id);
    }
}
