import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
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
    // JWT for legacy auth endpoints
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'jwt-secret',
      signOptions: { expiresIn: '15m' },
    }),
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
