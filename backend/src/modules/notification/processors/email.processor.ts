import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../../../common/prisma.service';
import { NotificationStatus } from '@prisma/client';

/**
 * Email Processor - Handles async email sending via Bull queue
 * Production-grade with retry logic and error handling
 */
@Processor('notifications')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private mailerService: MailerService,
    private prisma: PrismaService,
  ) {}

  @Process('send-notification')
  async handleSendNotification(job: Job) {
    const { notificationId } = job.data;
    
    this.logger.log(`Processing notification ${notificationId} (Attempt ${job.attemptsMade + 1}/${job.opts.attempts})`);

    try {
      // Fetch notification details
      const notification = await this.prisma.notification.findUnique({
        where: { id: notificationId },
        include: { user: true },
      });

      if (!notification) {
        throw new Error(`Notification ${notificationId} not found`);
      }

      // Update status to PROCESSING
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { status: NotificationStatus.PROCESSING },
      });

      await this.prisma.notificationLog.create({
        data: {
          notificationId,
          status: NotificationStatus.PROCESSING,
          message: `Processing email to ${notification.recipient}`,
        },
      });

      // Send email based on channel
      if (notification.channel === 'EMAIL') {
        await this.sendEmail(notification);
      } else {
        throw new Error(`Unsupported channel: ${notification.channel}`);
      }

      // Update status to SENT
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });

      await this.prisma.notificationLog.create({
        data: {
          notificationId,
          status: NotificationStatus.SENT,
          message: 'Email sent successfully',
        },
      });

      this.logger.log(`Notification ${notificationId} sent successfully`);

      // Mark as delivered (in production, this would be updated by webhook)
      setTimeout(async () => {
        await this.prisma.notification.update({
          where: { id: notificationId },
          data: {
            status: NotificationStatus.DELIVERED,
            deliveredAt: new Date(),
          },
        });

        await this.prisma.notificationLog.create({
          data: {
            notificationId,
            status: NotificationStatus.DELIVERED,
            message: 'Email delivered',
          },
        });
      }, 1000);

    } catch (error) {
      this.logger.error(`Failed to send notification ${notificationId}:`, error);

      // Update notification with error
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: NotificationStatus.FAILED,
          failedAt: new Date(),
          lastError: error.message,
          retryCount: { increment: 1 },
        },
      });

      await this.prisma.notificationLog.create({
        data: {
          notificationId,
          status: NotificationStatus.FAILED,
          message: error.message,
          errorDetails: {
            error: error.message,
            stack: error.stack,
            attempt: job.attemptsMade + 1,
          },
        },
      });

      // Re-throw to trigger Bull retry mechanism
      throw error;
    }
  }

  /**
   * Send email using MailerService
   */
  private async sendEmail(notification: any) {
    const { recipient, subject, templateId, templateData, locale } = notification;

    try {
      await this.mailerService.sendMail({
        to: recipient,
        subject: subject,
        template: `./${locale}/${templateId}`, // e.g., ./ar/registration-confirmation
        context: {
          ...templateData,
          year: new Date().getFullYear(),
          supportEmail: 'support@seu.edu.sa',
          platformUrl: process.env.FRONTEND_URL || 'https://courses.seu.edu.sa',
        },
      });
    } catch (error) {
      this.logger.error(`Email sending failed for ${recipient}:`, error);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }

  /**
   * Handle failed jobs (after all retries exhausted)
   */
  @Process('send-notification')
  async handleFailedJob(job: Job) {
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      const { notificationId } = job.data;
      
      this.logger.error(`Notification ${notificationId} failed after ${job.attemptsMade} attempts`);

      await this.prisma.notificationLog.create({
        data: {
          notificationId,
          status: NotificationStatus.FAILED,
          message: 'All retry attempts exhausted',
          errorDetails: {
            attempts: job.attemptsMade,
            lastError: job.failedReason,
          },
        },
      });

      // TODO: Alert admin about failed notification
      // TODO: Move to dead letter queue for manual review
    }
  }
}
