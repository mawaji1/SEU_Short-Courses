import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { createBetterAuth, BetterAuthInstance } from './better-auth.config';

/**
 * Better Auth Service
 *
 * Wraps Better Auth for use in NestJS dependency injection.
 * Provides access to the auth instance for guards and controllers.
 */
@Injectable()
export class BetterAuthService implements OnModuleInit {
  private auth: BetterAuthInstance;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.auth = createBetterAuth(this.prisma);
  }

  /**
   * Get the Better Auth instance
   */
  getAuth(): BetterAuthInstance {
    return this.auth;
  }

  /**
   * Handle an incoming request through Better Auth
   * This is used to mount Better Auth as a handler in NestJS
   */
  async handleRequest(request: Request): Promise<Response> {
    return this.auth.handler(request);
  }

  /**
   * Get session from request
   * Used by guards to validate authentication
   */
  async getSession(request: Request) {
    const session = await this.auth.api.getSession({
      headers: request.headers,
    });
    return session;
  }

  /**
   * Validate session and return user
   * Returns null if session is invalid
   */
  async validateSession(headers: Headers) {
    try {
      const session = await this.auth.api.getSession({ headers });
      if (!session?.user) {
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }
}
