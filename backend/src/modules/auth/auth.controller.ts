import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import * as express from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { BetterAuthGuard } from '../better-auth/better-auth.guard';
import { CurrentUser } from './decorators';

/**
 * Auth Controller (Legacy Endpoints)
 *
 * Handles auth endpoints NOT covered by Better Auth:
 * - GET /api/auth/me - Get current user profile
 * - POST /api/auth/change-password - Change password
 * - POST /api/auth/forgot-password - Request password reset
 * - POST /api/auth/reset-password - Reset password with token
 * - POST /api/auth/verify-email - Verify email
 * - POST /api/auth/resend-verification - Resend verification email
 * - POST /api/auth/send-verification - Send verification to current user
 *
 * NOTE: Login, register, logout, and session are now handled by Better Auth
 * at /api/auth/sign-in/email, /api/auth/sign-up/email, /api/auth/sign-out
 */
@Controller('auth/legacy')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Get current user profile
   */
  @Get('me')
  @UseGuards(BetterAuthGuard)
  async me(@CurrentUser('id') userId: string) {
    return this.authService.getUserById(userId);
  }

  /**
   * Change password
   */
  @Post('change-password')
  @UseGuards(BetterAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(userId, dto);
    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }

  /**
   * Request password reset
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  /**
   * Reset password with token
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  /**
   * Verify email with token
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  /**
   * Resend verification email
   */
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  /**
   * Send verification email to current user
   */
  @Post('send-verification')
  @UseGuards(BetterAuthGuard)
  @HttpCode(HttpStatus.OK)
  async sendVerification(@CurrentUser('id') userId: string) {
    return this.authService.sendVerificationEmail(userId);
  }
}
