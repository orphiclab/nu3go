import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PickupController } from './pickup.controller';
import { PickupService } from './pickup.service';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { MealLog } from '../meals/entities/meal-log.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Subscription, MealLog]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (cfg: ConfigService) => ({
                secret: cfg.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '15m' },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [PickupController],
    providers: [PickupService],
    exports: [PickupService],
})
export class PickupModule { }
