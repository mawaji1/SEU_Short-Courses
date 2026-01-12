import { Module } from '@nestjs/common';
import { TabbyWebhookController } from './tabby-webhook.controller';
import { TabbyWebhookService } from './tabby-webhook.service';
import { TamaraWebhookController } from './tamara-webhook.controller';
import { TamaraWebhookService } from './tamara-webhook.service';
import { PrismaService } from '../../../common/prisma.service';
import { TabbyService } from '../providers/tabby/tabby.service';
import { TamaraService } from '../providers/tamara/tamara.service';
import { NotificationModule } from '../../notification/notification.module';

/**
 * Webhook Module
 * Handles all payment provider webhooks (Tabby, Tamara)
 */
@Module({
    imports: [NotificationModule],
    controllers: [TabbyWebhookController, TamaraWebhookController],
    providers: [
        TabbyWebhookService,
        TamaraWebhookService,
        TabbyService,
        TamaraService,
        PrismaService,
    ],
    exports: [TabbyWebhookService, TamaraWebhookService],
})
export class WebhookModule {}
