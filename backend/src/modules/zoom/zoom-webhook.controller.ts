import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  Logger,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ZoomAuthService } from './zoom-auth.service';
import { ZoomWebhookService, ZoomWebhookPayload } from './zoom-webhook.service';

interface EndpointValidationEvent {
  event: 'endpoint.url_validation';
  payload: {
    plainToken: string;
  };
}

/**
 * Handles incoming Zoom webhooks.
 * Verifies signatures and routes events to the appropriate handlers.
 */
@Controller('webhooks/zoom')
export class ZoomWebhookController {
  private readonly logger = new Logger(ZoomWebhookController.name);

  constructor(
    private readonly authService: ZoomAuthService,
    private readonly webhookService: ZoomWebhookService,
  ) {}

  /**
   * Main webhook endpoint for all Zoom events.
   * Handles both endpoint validation (challenge) and actual events.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-zm-request-timestamp') timestamp: string,
    @Headers('x-zm-signature') signature: string,
    @Body() body: ZoomWebhookPayload | EndpointValidationEvent,
  ): Promise<unknown> {
    this.logger.debug(`Received Zoom webhook: ${body.event}`);

    // Handle endpoint URL validation (Zoom challenge)
    if (body.event === 'endpoint.url_validation') {
      return this.handleValidationChallenge(body as EndpointValidationEvent);
    }

    // Verify webhook signature for all other events
    if (!timestamp || !signature) {
      this.logger.warn('Missing timestamp or signature headers');
      throw new BadRequestException('Missing required headers');
    }

    const rawBody = req.rawBody?.toString();
    if (!rawBody) {
      this.logger.warn('No raw body available for signature verification');
      throw new BadRequestException('Unable to verify signature');
    }

    const isValid = await this.authService.verifyWebhookSignature(
      rawBody,
      timestamp,
      signature,
    );

    if (!isValid) {
      this.logger.warn('Invalid webhook signature');
      throw new UnauthorizedException('Invalid signature');
    }

    // Process the event
    try {
      await this.webhookService.handleEvent(body as ZoomWebhookPayload);
      return { status: 'ok' };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error}`);
      // Return success to Zoom even on processing errors
      // to prevent retries that could cause duplicate processing
      return { status: 'ok' };
    }
  }

  /**
   * Handle Zoom endpoint validation challenge.
   * Zoom sends this when setting up a webhook subscription.
   */
  private async handleValidationChallenge(
    event: EndpointValidationEvent,
  ): Promise<{ plainToken: string; encryptedToken: string }> {
    this.logger.log('Handling Zoom endpoint validation challenge');

    const { plainToken } = event.payload;
    const secretToken = this.authService.getWebhookSecretToken();

    // Generate the encrypted token using HMAC-SHA256
    const crypto = await import('crypto');
    const encryptedToken = crypto
      .createHmac('sha256', secretToken)
      .update(plainToken)
      .digest('hex');

    return {
      plainToken,
      encryptedToken,
    };
  }
}
