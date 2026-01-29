import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../../common/prisma.service';

/**
 * Auth Module (Legacy)
 *
 * NOTE: Authentication is now handled by BetterAuthModule.
 * This module provides:
 * - UserService for user management
 * - RolesGuard for RBAC
 * - Legacy auth endpoints (may be removed in future)
 * - Rate limiting for brute-force protection
 */
@Module({
  imports: [
    // Rate limiting configuration
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: 60000, // 60 seconds
        limit: 5, // 5 requests per 60 seconds for auth endpoints
      },
      {
        name: 'default',
        ttl: 60000, // 60 seconds
        limit: 10, // 10 requests per 60 seconds for other endpoints
      },
    ]),
  ],
  controllers: [AuthController, UserController],
  providers: [
    AuthService,
    UserService,
    PrismaService,
  ],
  exports: [AuthService, UserService],
})
export class AuthModule {}
