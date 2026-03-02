import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { CreditsModule } from '../credits/credits.module';
import { MealsModule } from '../meals/meals.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
    imports: [CreditsModule, MealsModule, ReportsModule],
    controllers: [AdminController],
})
export class AdminModule { }
