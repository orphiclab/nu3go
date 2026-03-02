import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
    @IsUUID()
    planId: string;

    @IsOptional()
    @IsUUID()
    locationId?: string;

    @IsOptional()
    @IsString()
    startDay?: string;
}

export class ChangePlanDto {
    @IsUUID()
    planId: string;
}

@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly svc: SubscriptionsService) { }

    @Post()
    create(@Request() req: any, @Body() dto: CreateSubscriptionDto) {
        return this.svc.create(req.user.sub, dto);
    }

    @Get('my')
    getMy(@Request() req: any) {
        return this.svc.getMy(req.user.sub);
    }

    @Patch('my/plan')
    changePlan(@Request() req: any, @Body() dto: ChangePlanDto) {
        return this.svc.changePlan(req.user.sub, dto.planId);
    }

    @Post('my/pause')
    pause(@Request() req: any, @Body() body: { reason?: string }) {
        return this.svc.pause(req.user.sub, body.reason);
    }

    @Post('my/resume')
    resume(@Request() req: any) {
        return this.svc.resume(req.user.sub);
    }

    @Patch('my/auto-renew')
    toggleAutoRenew(@Request() req: any, @Body() body: { autoRenew: boolean }) {
        return this.svc.toggleAutoRenew(req.user.sub, body.autoRenew);
    }

    @Post('my/cancel')
    cancel(@Request() req: any, @Body() body: { reason?: string }) {
        return this.svc.cancel(req.user.sub, body.reason);
    }
}
