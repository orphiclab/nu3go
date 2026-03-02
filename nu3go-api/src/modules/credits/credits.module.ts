import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';
import { CreditWallet, CreditTransaction } from './entities/credit.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CreditWallet, CreditTransaction])],
    controllers: [CreditsController],
    providers: [CreditsService],
    exports: [CreditsService],
})
export class CreditsModule { }
