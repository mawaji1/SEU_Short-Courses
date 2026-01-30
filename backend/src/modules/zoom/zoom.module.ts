import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { zoomConfig } from '../../config/zoom.config';
import { ZoomAuthService } from './zoom-auth.service';
import { ZoomUserService } from './zoom-user.service';
import { ZoomMeetingService } from './zoom-meeting.service';
import { ZoomWebhookController } from './zoom-webhook.controller';
import { ZoomWebhookService } from './zoom-webhook.service';

/**
 * Zoom Integration Module
 *
 * Provides services for:
 * - OAuth token management (Server-to-Server)
 * - User provisioning for instructors
 * - Meeting creation and management
 * - Webhook handling for attendance tracking
 */
@Module({
  imports: [
    ConfigModule.forFeature(zoomConfig),
  ],
  controllers: [ZoomWebhookController],
  providers: [
    ZoomAuthService,
    ZoomUserService,
    ZoomMeetingService,
    ZoomWebhookService,
  ],
  exports: [
    ZoomAuthService,
    ZoomUserService,
    ZoomMeetingService,
  ],
})
export class ZoomModule {}
