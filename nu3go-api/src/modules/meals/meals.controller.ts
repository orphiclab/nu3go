import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MealsService } from './meals.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('meals')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('meals')
export class MealsController {
    constructor(private readonly svc: MealsService) { }

    @Get('my/history')
    getMyHistory(
        @Request() req: any,
        @Query('limit') limit = 20,
        @Query('page') page = 1,
    ) {
        return this.svc.getMyHistory(req.user.sub, +limit, +page);
    }

    @Get('my/remaining')
    getMyRemaining(@Request() req: any) {
        return this.svc.getMyRemaining(req.user.sub);
    }
}
