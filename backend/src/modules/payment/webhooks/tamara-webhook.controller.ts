import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Headers, Query } from '@nestjs/common';
import { TamaraWebhookService } from './tamara-webhook.service';

/**
 * Tamara Webhook Controller
 * Handles webhook notifications from Tamara
 * 
 * PRODUCTION-READY:
 * - Returns 200 immediately
 * - Processes asynchronously
 * - Verifies JWT token
 * - Comprehensive logging
 */
@Controller('api/payments/webhooks/tamara')
export class TamaraWebhookController {
    private readonly logger = new Logger(TamaraWebhookController.name);

    constructor(private readonly webhookService: TamaraWebhookService) {}

    /**
     * Handle Tamara webhook notifications
     * POST /api/payments/webhooks/tamara?tamaraToken=xxx
     * 
     * Tamara sends webhooks for:
     * - "approved" - Order approved by customer
     * - "authorized" - Order authorized after merchant confirmation
     * - "declined" - Order declined
     * - "expired" - Order expired
     */
    @Post()
    @HttpCode(HttpStatus.OK)
    async handleWebhook(
        @Body() payload: any,
        @Query('tamaraToken') tamaraToken?: string,
        @Headers('authorization') authHeader?: string,
    ) {
        this.logger.log(`Received Tamara webhook: ${payload.order_id}, status: ${payload.order_status}`);

        try {
            // Return 200 immediately to acknowledge receipt
            // Process asynchronously in background
            setImmediate(async () => {
                try {
                    await this.webhookService.processWebhook(payload, tamaraToken, authHeader);
                } catch (error) {
                    this.logger.error('Failed to process Tamara webhook:', error);
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
