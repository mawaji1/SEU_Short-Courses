import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Headers,
} from '@nestjs/common';
import { TabbyWebhookService } from './tabby-webhook.service';

/**
 * Tabby Webhook Controller
 * Handles webhook notifications from Tabby
 *
 * PRODUCTION-READY:
 * - Returns 200 immediately
 * - Processes asynchronously
 * - Handles idempotency
 * - Comprehensive logging
 */
@Controller('payments/webhooks/tabby')
export class TabbyWebhookController {
  private readonly logger = new Logger(TabbyWebhookController.name);

  constructor(private readonly webhookService: TabbyWebhookService) {}

  /**
   * Handle Tabby webhook notifications
   * POST /api/payments/webhooks/tabby
   *
   * Tabby sends webhooks for:
   * - "authorized" - Payment authorized by customer
   * - "closed" - Payment captured and completed
   * - "expired" - Payment session expired
   * - "rejected" - Payment rejected
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: any,
    @Headers('authorization') authHeader?: string,
  ) {
    this.logger.log(
      `Received Tabby webhook: ${payload.id}, status: ${payload.status}`,
    );

    try {
      // Return 200 immediately to acknowledge receipt
      // Process asynchronously in background
      setImmediate(async () => {
        try {
          await this.webhookService.processWebhook(payload, authHeader);
        } catch (error) {
          this.logger.error('Failed to process Tabby webhook:', error);
        }
      });

      return {
        received: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Webhook handling error:', error);
      // Still return 200 to prevent retries
      return {
        received: true,
        error: 'processing_error',
      };
    }
  }
}
