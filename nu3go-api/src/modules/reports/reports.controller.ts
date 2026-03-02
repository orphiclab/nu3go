import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin', 'super_admin')
@Controller('reports')
export class ReportsController {
    constructor(private readonly svc: ReportsService) { }

    @Get('analytics/dashboard')
    getDashboard() {
        return this.svc.getDashboard();
    }

    @Get('analytics/revenue')
    getRevenueTrend(@Query('days') days = 30) {
        return this.svc.getRevenueTrend(+days);
    }

    @Get('analytics/plan-distribution')
    getPlanDistribution() {
        return this.svc.getPlanDistribution();
    }

    @Get('export')
    async exportExcel(@Query('days') days = 30, @Res() res: Response) {
        const buf = await this.svc.exportReport(+days);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=nu3go-report.xlsx');
        res.send(buf);
    }
}
