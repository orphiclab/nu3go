import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '@nestjs-modules/ioredis';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PlansModule } from './modules/plans/plans.module';
import { MealsModule } from './modules/meals/meals.module';
import { PickupModule } from './modules/pickup/pickup.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { KitchenModule } from './modules/kitchen/kitchen.module';
import { CreditsModule } from './modules/credits/credits.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AdminModule } from './modules/admin/admin.module';
import { MenusModule } from './modules/menus/menus.module';
import { LocationsModule } from './modules/locations/locations.module';
import { CorporateModule } from './modules/corporate/corporate.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { NfcModule } from './modules/nfc/nfc.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
        }),

        // Database
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                url: config.get<string>('DATABASE_URL'),
                autoLoadEntities: true,
                synchronize: false,
                logging: config.get('NODE_ENV') === 'development',
                ssl:
                    config.get('NODE_ENV') === 'production'
                        ? { rejectUnauthorized: false }
                        : false,
                retryAttempts: 10,
                retryDelay: 3000,
                extra: {
                    max: 20,
                    idleTimeoutMillis: 30000,
                    connectionTimeoutMillis: 5000,
                },
            }),
            inject: [ConfigService],
        }),

        // Redis (for OTP, distributed locks, caching)
        RedisModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                type: 'single',
                url: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
            }),
            inject: [ConfigService],
        }),

        // Rate Limiting
        ThrottlerModule.forRoot([
            {
                name: 'global',
                ttl: 60000,
                limit: 100,
            },
            {
                name: 'auth',
                ttl: 60000,
                limit: 10,
            },
        ]),

        // Cron Jobs
        ScheduleModule.forRoot(),

        // Domain Modules
        NotificationsModule,   // Global — must be first
        AuthModule,
        UsersModule,
        SubscriptionsModule,
        PlansModule,
        MealsModule,
        PickupModule,
        DeliveryModule,
        KitchenModule,
        CreditsModule,
        PaymentsModule,
        ReportsModule,
        AdminModule,
        MenusModule,
        LocationsModule,
        CorporateModule,
        SchedulerModule,
        NfcModule,
    ],
    controllers: [HealthController],
})
export class AppModule { }
