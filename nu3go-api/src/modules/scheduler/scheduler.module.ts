import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PauseCreditCron, AutoRenewCron, ExpiryCheckCron } from './cron.jobs';

@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [PauseCreditCron, AutoRenewCron, ExpiryCheckCron],
})
export class SchedulerModule { }
