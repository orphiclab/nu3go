import { Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { KitchenService } from './kitchen.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('kitchen')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin', 'super_admin', 'kitchen_staff')
@Controller('kitchen')
export class KitchenController {
    constructor(private readonly svc: KitchenService) { }

    @Get('count')
    getCount(@Query('date') date: string) {
        return this.svc.getCount(date ?? new Date().toISOString().split('T')[0]);
    }

    @Post('mark-printed')
    markPrinted(@Query('date') date: string) {
        return this.svc.markPrinted(date ?? new Date().toISOString().split('T')[0]);
    }

    @Get('export-pdf')
    async exportPdf(@Query('date') date: string, @Res() res: Response) {
        const buf = await this.svc.exportPdf(date ?? new Date().toISOString().split('T')[0]);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=kitchen-${date}.pdf`);
        res.send(buf);
    }
}
