import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/send-notification.dto';

/**
 * Notification Controller
 * Handles notification-related endpoints
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  /**
   * Get user's notifications
   */
  @Get()
  async getUserNotifications(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationService.getUserNotifications(userId);
  }

  /**
   * Get notification status
   */
  @Get(':id')
  async getNotificationStatus(@Param('id') id: string) {
    return this.notificationService.getNotificationStatus(id);
  }

  /**
   * Send notification (admin only - for testing)
   */
  @Post()
  async sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationService.sendNotification(dto);
  }

  /**
   * Retry failed notification
   */
  @Post(':id/retry')
  async retryNotification(@Param('id') id: string) {
    return this.notificationService.retryNotification(id);
  }
}
