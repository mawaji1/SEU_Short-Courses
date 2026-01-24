import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsObject,
  IsDateString,
} from 'class-validator';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '@prisma/client';

export class SendNotificationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsString()
  recipient: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  templateId: string;

  @IsObject()
  templateData: Record<string, any>;

  @IsOptional()
  @IsString()
  locale?: string = 'ar';

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority = NotificationPriority.NORMAL;

  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
