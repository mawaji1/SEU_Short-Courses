import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationPriority,
} from '@prisma/client';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationResult } from './interfaces/notification.interface';

/**
 * Production-grade Notification Service
 * Handles async notification processing with queue, retry logic, and delivery tracking
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  /**
   * Send a notification (queues it for async processing)
   */
  async sendNotification(
    dto: SendNotificationDto,
  ): Promise<NotificationResult> {
    try {
      // Create notification record
      const notification = await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          type: dto.type,
          channel: dto.channel,
          recipient: dto.recipient,
          subject: dto.subject,
          templateId: dto.templateId,
          templateData: dto.templateData,
          locale: dto.locale || 'ar',
          priority: dto.priority || NotificationPriority.NORMAL,
          scheduledAt: dto.scheduledAt,
          status: NotificationStatus.QUEUED,
          metadata: dto.metadata,
        },
      });

      // Log creation
      await this.createLog(
        notification.id,
        NotificationStatus.QUEUED,
        'Notification queued for processing',
      );

      // Add to queue based on priority
      const delay = this.getQueueDelay(dto.priority);
      await this.notificationQueue.add(
        'send-notification',
        { notificationId: notification.id },
        {
          priority: this.getQueuePriority(dto.priority),
          delay,
          attempts: notification.maxRetries,
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5 seconds
          },
        },
      );

      this.logger.log(`Notification ${notification.id} queued successfully`);

      return {
        success: true,
        notificationId: notification.id,
      };
    } catch (error) {
      this.logger.error('Failed to queue notification:', error);
      return {
        success: false,
        notificationId: '',
        error: error.message,
      };
    }
  }

  /**
   * Send registration confirmation email
   */
  async sendRegistrationConfirmation(
    userId: string,
    email: string,
    data: {
      userName: string;
      programName: string;
      cohortName: string;
      registrationId: string;
      amount: string;
    },
    locale: string = 'ar',
  ): Promise<NotificationResult> {
    return this.sendNotification({
      userId,
      type: NotificationType.REGISTRATION_CONFIRMATION,
      channel: NotificationChannel.EMAIL,
      recipient: email,
      subject:
        locale === 'ar'
          ? 'تأكيد التسجيل - الجامعة السعودية الإلكترونية'
          : 'Registration Confirmation - SEU',
      templateId: 'registration-confirmation',
      templateData: data,
      locale,
      priority: NotificationPriority.HIGH,
    });
  }

  /**
   * Send payment receipt email
   */
  async sendPaymentReceipt(
    userId: string,
    email: string,
    data: {
      userName: string;
      programName: string;
      cohortName: string;
      amount: string;
      paymentId: string;
      registrationId: string;
      invoiceUrl?: string;
    },
    locale: string = 'ar',
  ): Promise<NotificationResult> {
    return this.sendNotification({
      userId,
      type: NotificationType.PAYMENT_RECEIPT,
      channel: NotificationChannel.EMAIL,
      recipient: email,
      subject:
        locale === 'ar'
          ? 'إيصال الدفع - الجامعة السعودية الإلكترونية'
          : 'Payment Receipt - SEU',
      templateId: 'payment-receipt',
      templateData: data,
      locale,
      priority: NotificationPriority.HIGH,
    });
  }

  /**
   * Send payment failed notification
   */
  async sendPaymentFailed(
    userId: string,
    email: string,
    data: {
      userName: string;
      programName: string;
      cohortName: string;
      amount: string;
      reason?: string;
    },
    locale: string = 'ar',
  ): Promise<NotificationResult> {
    return this.sendNotification({
      userId,
      type: NotificationType.PAYMENT_FAILED,
      channel: NotificationChannel.EMAIL,
      recipient: email,
      subject:
        locale === 'ar'
          ? 'فشل عملية الدفع - الجامعة السعودية الإلكترونية'
          : 'Payment Failed - SEU',
      templateId: 'payment-failed',
      templateData: data,
      locale,
      priority: NotificationPriority.URGENT,
    });
  }

  /**
   * Send Blackboard access instructions
   */
  async sendBlackboardAccess(
    userId: string,
    email: string,
    data: {
      userName: string;
      programName: string;
      cohortName: string;
      blackboardUrl: string;
      blackboardUsername: string;
      blackboardPassword: string;
    },
    locale: string = 'ar',
  ): Promise<NotificationResult> {
    return this.sendNotification({
      userId,
      type: NotificationType.BLACKBOARD_ACCESS,
      channel: NotificationChannel.EMAIL,
      recipient: email,
      subject:
        locale === 'ar'
          ? 'معلومات الدخول إلى المنصة التعليمية'
          : 'LMS Access Information',
      templateId: 'blackboard-access',
      templateData: data,
      locale,
      priority: NotificationPriority.HIGH,
    });
  }

  /**
   * Send admin alert for system issues
   */
  async sendAdminAlert(data: {
    subject: string;
    message: string;
    priority?: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
    metadata?: any;
  }): Promise<NotificationResult> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@seu.edu.sa';

    return this.sendNotification({
      userId: 'system', // System-generated notification
      type: NotificationType.SYSTEM_ALERT,
      channel: NotificationChannel.EMAIL,
      recipient: adminEmail,
      subject: `[ADMIN ALERT] ${data.subject}`,
      templateId: 'admin-alert',
      templateData: {
        subject: data.subject,
        message: data.message,
        timestamp: new Date().toISOString(),
        ...data.metadata,
      },
      locale: 'en',
      priority: data.priority
        ? NotificationPriority[data.priority]
        : NotificationPriority.HIGH,
      metadata: data.metadata,
    });
  }

  /**
   * Send course completion notification
   */
  async sendCourseCompletion(
    userId: string,
    email: string,
    data: {
      userName: string;
      programName: string;
      cohortName: string;
      completedAt: string;
    },
    locale: string = 'ar',
  ): Promise<NotificationResult> {
    return this.sendNotification({
      userId,
      type: NotificationType.COURSE_REMINDER, // Will use COMPLETION type when added
      channel: NotificationChannel.EMAIL,
      recipient: email,
      subject:
        locale === 'ar'
          ? 'تهانينا! لقد أكملت الدورة بنجاح'
          : 'Congratulations! Course Completed',
      templateId: 'course-completion',
      templateData: data,
      locale,
      priority: NotificationPriority.HIGH,
    });
  }

  /**
   * Get notification status
   */
  async getNotificationStatus(notificationId: string) {
    return this.prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    });
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit: number = 50) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });
  }

  /**
   * Create notification log entry
   */
  async createLog(
    notificationId: string,
    status: NotificationStatus,
    message?: string,
    errorDetails?: any,
  ) {
    return this.prisma.notificationLog.create({
      data: {
        notificationId,
        status,
        message,
        errorDetails: errorDetails
          ? JSON.parse(JSON.stringify(errorDetails))
          : null,
      },
    });
  }

  /**
   * Update notification status
   */
  async updateStatus(
    notificationId: string,
    status: NotificationStatus,
    additionalData?: {
      sentAt?: Date;
      deliveredAt?: Date;
      failedAt?: Date;
      lastError?: string;
      retryCount?: number;
    },
  ) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status,
        ...additionalData,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Get queue delay based on priority
   */
  private getQueueDelay(priority?: NotificationPriority): number {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 0; // Immediate
      case NotificationPriority.HIGH:
        return 1000; // 1 second
      case NotificationPriority.NORMAL:
        return 5000; // 5 seconds
      case NotificationPriority.LOW:
        return 30000; // 30 seconds
      default:
        return 5000;
    }
  }

  /**
   * Get Bull queue priority (higher number = higher priority)
   */
  private getQueuePriority(priority?: NotificationPriority): number {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 1;
      case NotificationPriority.HIGH:
        return 2;
      case NotificationPriority.NORMAL:
        return 3;
      case NotificationPriority.LOW:
        return 4;
      default:
        return 3;
    }
  }

  /**
   * Retry failed notification
   */
  async retryNotification(notificationId: string): Promise<NotificationResult> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return {
        success: false,
        notificationId,
        error: 'Notification not found',
      };
    }

    if (notification.status === NotificationStatus.DELIVERED) {
      return {
        success: false,
        notificationId,
        error: 'Notification already delivered',
      };
    }

    // Reset status and add back to queue
    await this.updateStatus(notificationId, NotificationStatus.QUEUED);
    await this.createLog(
      notificationId,
      NotificationStatus.QUEUED,
      'Manual retry initiated',
    );

    await this.notificationQueue.add(
      'send-notification',
      { notificationId },
      {
        priority: this.getQueuePriority(notification.priority),
        attempts: notification.maxRetries - notification.retryCount,
      },
    );

    return {
      success: true,
      notificationId,
    };
  }
}
