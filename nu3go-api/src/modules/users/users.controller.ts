import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
    constructor(private readonly svc: UsersService) { }

    @Get('me')
    getMe(@Request() req: any) {
        return this.svc.findById(req.user.sub);
    }

    @Patch('me')
    updateMe(@Request() req: any, @Body() body: any) {
        return this.svc.updateMe(req.user.sub, body);
    }
}
