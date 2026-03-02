import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Request,
    Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { Throttle } from '@nestjs/throttler';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    @MinLength(2)
    fullName: string;

    @IsOptional()
    @IsString()
    phone?: string;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class verifyOtpDto {
    @IsEmail()
    email: string;

    @IsString()
    otp: string;
}

export class ChangePasswordDto {
    @IsString()
    currentPassword: string;

    @IsString()
    @MinLength(8)
    newPassword: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Throttle({ auth: { limit: 10, ttl: 60000 } })
    @Post('verify-otp')
    verifyOtp(@Body() dto: verifyOtpDto) {
        return this.authService.verifyOtp(dto);
    }

    @Post('resend-otp')
    resendOtp(@Body() body: { email: string }) {
        return this.authService.resendOtp(body.email);
    }

    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    refresh(@Body() body: { refreshToken: string }) {
        return this.authService.refresh(body.refreshToken);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getMe(@Request() req: any) {
        return this.authService.getMe(req.user.sub);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    logout() {
        return { message: 'Logged out.' };
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Post('change-password')
    changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
        return this.authService.changePassword(req.user.sub, dto.currentPassword, dto.newPassword);
    }
}
