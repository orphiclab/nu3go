import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealsController } from './meals.controller';
import { MealsService } from './meals.service';
import { MealLog } from './entities/meal-log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MealLog])],
    controllers: [MealsController],
    providers: [MealsService],
    exports: [MealsService],
})
export class MealsModule { }
