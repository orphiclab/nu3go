import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT ?? 587),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendOtp(email: string, otp: string) {
        await this.sendEmail(email, 'Your nu3go verification code', `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#15803d">Verify your email</h2>
      <p>Your verification code is:</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#111827;text-align:center;padding:20px;background:#f9fafb;border-radius:8px;margin:20px 0">
        ${otp}
      </div>
      <p style="color:#6b7280;font-size:14px">This code expires in 10 minutes. Do not share it with anyone.</p>
    </div>`);
    }

    async sendSubscriptionConfirmation(email: string, planName: string, endDate: string) {
        await this.sendEmail(email, `Your nu3go ${planName} subscription is active!`, `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#15803d">Welcome to nu3go! 🎉</h2>
      <p>Your <strong>${planName}</strong> subscription is now active.</p>
      <p>Your subscription is valid until <strong>${endDate}</strong>.</p>
      <p style="color:#6b7280;font-size:14px">Log in to your dashboard to view your QR code and meal history.</p>
    </div>`);
    }

    async sendPauseConfirmation(email: string) {
        await this.sendEmail(email, 'Your nu3go subscription is paused', `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#15803d">Subscription paused</h2>
      <p>Your subscription has been paused. Credits for unused days will be applied within 48 hours.</p>
      <p>You can resume anytime from your dashboard.</p>
    </div>`);
    }

    async sendRenewalReminder(email: string, endDate: string) {
        await this.sendEmail(email, 'Your nu3go subscription renews soon', `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#15803d">Renewal reminder</h2>
      <p>Your subscription expires on <strong>${endDate}</strong>.</p>
      <p>Log in to ensure auto-renew is enabled or renew manually.</p>
    </div>`);
    }

    async sendPickupConfirmation(email: string, mealDate: string) {
        await this.sendEmail(email, 'Meal pickup confirmed – nu3go', `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#15803d">Pickup confirmed ✅</h2>
      <p>Your meal for <strong>${mealDate}</strong> has been logged. Enjoy!</p>
    </div>`);
    }

    private async sendEmail(to: string, subject: string, html: string) {
        try {
            await this.transporter.sendMail({
                from: `"${process.env.FROM_NAME ?? 'nu3go'}" <${process.env.FROM_EMAIL ?? 'noreply@nu3go.lk'}>`,
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent to ${to}: ${subject}`);
        } catch (err) {
            this.logger.error(`Failed to send email to ${to}`, err);
        }
    }
}
