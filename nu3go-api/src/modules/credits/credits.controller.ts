import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreditsService } from './credits.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('credits')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('credits')
export class CreditsController {
    constructor(private readonly svc: CreditsService) { }

    @Get('my/balance')
    getBalance(@Request() req: any) {
        return this.svc.getBalance(req.user.sub);
    }

    @Get('my/history')
    getHistory(
        @Request() req: any,
        @Query('limit') limit = 20,
        @Query('page') page = 1,
    ) {
        return this.svc.getHistory(req.user.sub, +limit, +page);
    }
}
