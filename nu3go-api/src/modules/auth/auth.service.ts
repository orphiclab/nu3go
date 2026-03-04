import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    NotFoundException,
    BadRequestException,
    Optional,
    Inject,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
        @Optional() @Inject('IORedisModuleConnectionToken') private readonly redis: Redis | null,
        private readonly notificationsService: NotificationsService,
    ) {
        if (!this.redis) {
            this.logger.warn('Redis not available — OTP features will be disabled');
        }
    }

    async register(dto: {
        email: string;
        password: string;
        fullName: string;
        phone?: string;
    }) {
        const existing = await this.userRepo.findOne({
            where: { email: dto.email.toLowerCase() },
        });

        if (existing) {
            throw new ConflictException({
                code: 'EMAIL_ALREADY_EXISTS',
                message: 'An account with this email already exists.',
            });
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = this.userRepo.create({
            email: dto.email.toLowerCase(),
            passwordHash,
            fullName: dto.fullName,
            phone: dto.phone,
            isVerified: false,
        });

        await this.userRepo.save(user);

        // Generate 6-digit OTP and store in Redis (10 minutes)
        const otp = this.generateOtp();
        if (this.redis) {
            await this.redis.setex(`otp:${user.email}`, 600, otp);
        }

        // Send OTP via email
        try {
            await this.notificationsService.sendOtp(user.email, otp);
        } catch (err) {
            // Don't fail registration if email fails; user can resend
        }

        return {
            message: 'Account created. Check your email for a verification code.',
            email: user.email,
        };
    }

    async verifyOtp(dto: { email: string; otp: string }) {
        if (!this.redis) {
            throw new BadRequestException({ code: 'REDIS_UNAVAILABLE', message: 'OTP service is temporarily unavailable.' });
        }
        const storedOtp = await this.redis.get(`otp:${dto.email.toLowerCase()}`);

        if (!storedOtp) {
            throw new BadRequestException({
                code: 'OTP_EXPIRED',
                message: 'Verification code has expired. Please request a new one.',
            });
        }

        if (storedOtp !== dto.otp.trim()) {
            throw new BadRequestException({
                code: 'OTP_INVALID',
                message: 'Incorrect verification code. Please try again.',
            });
        }

        const user = await this.userRepo.findOne({
            where: { email: dto.email.toLowerCase() },
        });

        if (!user) throw new NotFoundException({ code: 'USER_NOT_FOUND' });

        // Mark verified + delete OTP
        await this.userRepo.update(user.id, { isVerified: true });
        if (this.redis) {
            await this.redis.del(`otp:${dto.email.toLowerCase()}`);
        }

        return this.generateTokens(user);
    }

    async resendOtp(email: string) {
        if (!this.redis) {
            throw new BadRequestException({ code: 'REDIS_UNAVAILABLE', message: 'OTP service is temporarily unavailable.' });
        }
        const normalizedEmail = email.toLowerCase();

        // Rate-limit: only allow resend once every 60 seconds
        const cooldownKey = `otp_cooldown:${normalizedEmail}`;
        const inCooldown = await this.redis.get(cooldownKey);
        if (inCooldown) {
            throw new BadRequestException({
                code: 'OTP_COOLDOWN',
                message: 'Please wait 60 seconds before requesting a new code.',
            });
        }

        const user = await this.userRepo.findOne({ where: { email: normalizedEmail } });
        if (!user) throw new NotFoundException({ code: 'USER_NOT_FOUND' });

        if (user.isVerified) {
            throw new BadRequestException({
                code: 'ALREADY_VERIFIED',
                message: 'Your account is already verified.',
            });
        }

        const otp = this.generateOtp();
        await this.redis.setex(`otp:${normalizedEmail}`, 600, otp);
        await this.redis.setex(cooldownKey, 60, '1');

        await this.notificationsService.sendOtp(user.email, otp);

        return { message: 'New verification code sent.' };
    }

    async login(dto: { email: string; password: string }) {
        const user = await this.userRepo.findOne({
            where: { email: dto.email.toLowerCase(), isActive: true },
        });

        if (!user) {
            throw new UnauthorizedException({
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password.',
            });
        }

        if (!user.isVerified) {
            throw new UnauthorizedException({
                code: 'EMAIL_NOT_VERIFIED',
                message: 'Please verify your email before logging in.',
            });
        }

        const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordMatch) {
            throw new UnauthorizedException({
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password.',
            });
        }

        return this.generateTokens(user);
    }

    async refresh(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });

            const user = await this.userRepo.findOne({
                where: { id: payload.sub, isActive: true },
            });

            if (!user) throw new Error('User not found');

            return this.generateTokens(user);
        } catch {
            throw new UnauthorizedException({
                code: 'INVALID_REFRESH_TOKEN',
                message: 'Session expired. Please log in again.',
            });
        }
    }

    async getMe(userId: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException();

        const { passwordHash: _, ...safeUser } = user as User & { passwordHash?: string };
        return safeUser;
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException();

        const match = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!match) {
            throw new UnauthorizedException({
                code: 'WRONG_PASSWORD',
                message: 'Current password is incorrect.',
            });
        }

        const newHash = await bcrypt.hash(newPassword, 12);
        await this.userRepo.update(userId, { passwordHash: newHash } as any);

        return { message: 'Password changed successfully.' };
    }

    private generateTokens(user: User) {
        const payload = { sub: user.id, role: user.role, email: user.email };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: process.env.JWT_EXPIRY || '15m',
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
        });

        return {
            data: { accessToken, refreshToken },
            message: 'Authentication successful.',
        };
    }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
