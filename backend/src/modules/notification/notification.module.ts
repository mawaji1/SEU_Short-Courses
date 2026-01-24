import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { EmailProcessor } from './processors/email.processor';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [
    // Bull Queue for async processing
    BullModule.registerQueue({
      name: 'notifications',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 500, // Keep last 500 failed jobs for debugging
      },
    }),

    // Mailer configuration
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: `"${process.env.SMTP_FROM_NAME || 'SEU التدريب الاحترافي'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@seu.edu.sa'}>`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, EmailProcessor, PrismaService],
  exports: [NotificationService],
})
export class NotificationModule {}
