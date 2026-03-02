import { Controller, Get, Patch, Param, Body, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { DeliveryService } from './delivery.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('delivery')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin', 'super_admin', 'delivery_manager')
@Controller('delivery')
export class DeliveryController {
    constructor(private readonly svc: DeliveryService) { }

    @Get('schedule')
    getSchedule(@Query('date') date: string) {
        return this.svc.getSchedule(date ?? new Date().toISOString().split('T')[0]);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: 'delivered' | 'failed' }) {
        return this.svc.updateStatus(id, body.status);
    }

    @Get('export')
    async exportExcel(@Query('date') date: string, @Res() res: Response) {
        const buffer = await this.svc.exportExcel(date ?? new Date().toISOString().split('T')[0]);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=delivery-${date}.xlsx`);
        res.send(buffer);
    }
}
