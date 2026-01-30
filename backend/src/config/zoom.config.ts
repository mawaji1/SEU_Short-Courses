import { registerAs } from '@nestjs/config';

export interface ZoomConfig {
  accountId: string;
  clientId: string;
  clientSecret: string;
  webhookSecretToken: string;
}

export const zoomConfig = registerAs('zoom', (): ZoomConfig => {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const webhookSecretToken = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;

  // Validate required config on startup
  const missing: string[] = [];
  if (!accountId) missing.push('ZOOM_ACCOUNT_ID');
  if (!clientId) missing.push('ZOOM_CLIENT_ID');
  if (!clientSecret) missing.push('ZOOM_CLIENT_SECRET');
  if (!webhookSecretToken) missing.push('ZOOM_WEBHOOK_SECRET_TOKEN');

  if (missing.length > 0) {
    throw new Error(
      `Missing required Zoom configuration: ${missing.join(', ')}. ` +
        'Please set these environment variables.',
    );
  }

  return {
    accountId: accountId!,
    clientId: clientId!,
    clientSecret: clientSecret!,
    webhookSecretToken: webhookSecretToken!,
  };
});

export const ZOOM_CONFIG_KEY = 'zoom';
