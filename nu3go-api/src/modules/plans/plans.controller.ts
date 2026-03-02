import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('plans')
@Controller('plans')
export class PlansController {
    constructor(private readonly svc: PlansService) { }

    @Get()
    findAll(@Query('corporate') corporate?: string) {
        return this.svc.findAll(corporate === 'true');
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.svc.findOne(id);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin', 'super_admin')
    @Post()
    create(@Body() body: any) {
        return this.svc.create(body);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin', 'super_admin')
    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.svc.update(id, body);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('super_admin')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.svc.remove(id);
    }
}
