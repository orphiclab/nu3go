import {
    Controller, Get, Post, Body, Param, UseGuards, Request
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PickupService } from './pickup.service';

@ApiTags('pickup')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('pickup')
export class PickupController {
    constructor(private readonly svc: PickupService) { }

    /** Get customer's QR token */
    @Get('qr/my-code')
    getMyQr(@Request() req: any) {
        return this.svc.generateQrToken(req.user.sub);
    }

    /** Refresh QR token */
    @Post('qr/refresh')
    refreshQr(@Request() req: any) {
        return this.svc.generateQrToken(req.user.sub);
    }

    /** QR validation (customer self-scan) */
    @Post('qr/validate')
    validateQr(@Body() body: { token: string }) {
        return this.svc.validateQr(body.token);
    }

    /** NFC validation (called from NFC landing page) */
    @Get('nfc/:token')
    validateNfc(@Param('token') token: string) {
        return this.svc.validateNfc(token);
    }
}
