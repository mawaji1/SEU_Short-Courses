import { NotificationType, NotificationChannel, NotificationPriority } from '@prisma/client';

export interface SendNotificationDto {
  userId?: string;
  type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  templateId: string;
  templateData: Record<string, any>;
  locale?: string;
  priority?: NotificationPriority;
  scheduledAt?: Date;
  metadata?: Record<string, any>;
}

export interface EmailTemplateData {
  userName: string;
  programName?: string;
  cohortName?: string;
  amount?: string;
  paymentId?: string;
  registrationId?: string;
  blackboardUrl?: string;
  blackboardUsername?: string;
  blackboardPassword?: string;
  certificateUrl?: string;
  verificationCode?: string;
  [key: string]: any;
}

export interface NotificationResult {
  success: boolean;
  notificationId: string;
  error?: string;
}
