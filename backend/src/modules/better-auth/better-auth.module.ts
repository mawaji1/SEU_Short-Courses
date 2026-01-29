import { Global, Module } from '@nestjs/common';
import { BetterAuthService } from './better-auth.service';
import { BetterAuthGuard } from './better-auth.guard';
import { BetterAuthController } from './better-auth.controller';

/**
 * Better Auth Module
 *
 * Provides Better Auth integration for NestJS:
 * - BetterAuthService: Core auth operations
 * - BetterAuthGuard: Route protection (replaces JwtAuthGuard)
 * - BetterAuthController: Handles /api/auth/* routes
 *
 * This is a global module so BetterAuthGuard can be used in any module
 * without explicitly importing BetterAuthModule.
 */
@Global()
@Module({
  controllers: [BetterAuthController],
  providers: [BetterAuthService, BetterAuthGuard],
  exports: [BetterAuthService, BetterAuthGuard],
})
export class BetterAuthModule {}
