import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZoomConfig, ZOOM_CONFIG_KEY } from '../../config/zoom.config';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/**
 * Manages Server-to-Server OAuth tokens for Zoom API.
 * Tokens are cached and automatically refreshed when expired.
 */
@Injectable()
export class ZoomAuthService {
  private readonly logger = new Logger(ZoomAuthService.name);
  private readonly config: ZoomConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<ZoomConfig>(ZOOM_CONFIG_KEY);
    if (!config) {
      throw new Error('Zoom configuration not found');
    }
    this.config = config;
  }

  /**
   * Get a valid access token, fetching a new one if needed.
   * Tokens are cached and refreshed 5 minutes before expiry.
   */
  async getAccessToken(): Promise<string> {
    const bufferMs = 5 * 60 * 1000; // 5 minutes buffer
    const now = Date.now();

    if (this.accessToken && this.tokenExpiresAt - bufferMs > now) {
      return this.accessToken;
    }

    return this.refreshToken();
  }

  /**
   * Fetch a new Server-to-Server OAuth token from Zoom.
   */
  private async refreshToken(): Promise<string> {
    this.logger.debug('Fetching new Zoom access token');

    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
    ).toString('base64');

    const url = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.config.accountId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Failed to fetch Zoom token: ${response.status} ${errorText}`,
      );
      throw new Error(`Failed to fetch Zoom access token: ${response.status}`);
    }

    const data: TokenResponse = await response.json();

    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;

    this.logger.debug(
      `Zoom token refreshed, expires in ${data.expires_in} seconds`,
    );

    return this.accessToken;
  }

  /**
   * Verify a Zoom webhook signature.
   * Uses the secret token to validate the request is from Zoom.
   */
  async verifyWebhookSignature(
    payload: string,
    timestamp: string,
    signature: string,
  ): Promise<boolean> {
    const crypto = await import('crypto');
    const message = `v0:${timestamp}:${payload}`;
    const expectedSignature =
      'v0=' +
      crypto
        .createHmac('sha256', this.config.webhookSecretToken)
        .update(message)
        .digest('hex');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    // timingSafeEqual throws if lengths differ, so check first
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  }

  /**
   * Get webhook secret token for endpoint validation challenge.
   */
  getWebhookSecretToken(): string {
    return this.config.webhookSecretToken;
  }
}
