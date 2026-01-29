import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { BetterAuthService } from './better-auth.service';

/**
 * Better Auth Controller
 *
 * Catches all /api/auth/* routes and forwards them to Better Auth.
 * Better Auth handles: sign-in, sign-up, sign-out, session, etc.
 */
@Controller('auth')
export class BetterAuthController {
  constructor(private readonly betterAuthService: BetterAuthService) {}

  /**
   * Handle all auth routes
   * Better Auth expects Web Request/Response, so we convert
   */
  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    try {
      // Build full URL for Better Auth
      const protocol = req.protocol;
      const host = req.get('host');
      const url = `${protocol}://${host}${req.originalUrl}`;

      // Convert Express request to Web Request
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value) {
          headers.set(key, Array.isArray(value) ? value.join(', ') : value);
        }
      }

      // Add cookies to headers
      if (req.cookies) {
        const cookieHeader = Object.entries(req.cookies)
          .map(([key, value]) => `${key}=${value}`)
          .join('; ');
        if (cookieHeader) {
          headers.set('cookie', cookieHeader);
        }
      }

      const webRequest = new Request(url, {
        method: req.method,
        headers,
        body: ['GET', 'HEAD'].includes(req.method)
          ? undefined
          : JSON.stringify(req.body),
      });

      // Pass to Better Auth
      const webResponse = await this.betterAuthService.handleRequest(webRequest);

      // Log the response for debugging
      console.log('Better Auth response status:', webResponse.status);
      const responseBody = await webResponse.clone().text();
      console.log('Better Auth response body:', responseBody);

      // Convert Web Response to Express Response
      // Set status
      res.status(webResponse.status);

      // Set headers
      webResponse.headers.forEach((value, key) => {
        // Handle Set-Cookie specially (can have multiple values)
        if (key.toLowerCase() === 'set-cookie') {
          // Get all Set-Cookie headers
          const cookies = webResponse.headers.getSetCookie();
          cookies.forEach((cookie) => {
            res.append('Set-Cookie', cookie);
          });
        } else {
          res.set(key, value);
        }
      });

      // Send body
      const body = await webResponse.text();
      if (body) {
        res.send(body);
      } else {
        res.end();
      }
    } catch (error) {
      console.error('Better Auth error:', error);
      res.status(500).json({ error: 'Authentication error', details: String(error) });
    }
  }
}
