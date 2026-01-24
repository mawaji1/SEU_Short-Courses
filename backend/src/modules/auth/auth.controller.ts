import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    Res,
    Req,
} from '@nestjs/common';
import * as express from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators';

// Cookie configuration constants
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
};

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const REFRESH_TOKEN_REMEMBER_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Auth Controller
 * 
 * REST API endpoints for authentication:
 * - POST /api/auth/register - User registration
 * - POST /api/auth/login - User login
 * - POST /api/auth/refresh - Refresh access token
 * - POST /api/auth/logout - Clear auth cookies
 * - GET /api/auth/me - Get current user profile
 * - POST /api/auth/change-password - Change password
 * - POST /api/auth/forgot-password - Request password reset
 * - POST /api/auth/reset-password - Reset password with token
 * 
 * Security:
 * - Tokens are stored in HttpOnly cookies (not accessible via JavaScript)
 * - Rate limiting applied to prevent brute-force attacks
 */
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Set auth cookies on response
     */
    private setAuthCookies(res: express.Response, accessToken: string, refreshToken: string, rememberMe = false) {
        res.cookie('access_token', accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: ACCESS_TOKEN_MAX_AGE,
        });

        res.cookie('refresh_token', refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: rememberMe ? REFRESH_TOKEN_REMEMBER_MAX_AGE : REFRESH_TOKEN_MAX_AGE,
        });
    }

    /**
     * Clear auth cookies
     */
    private clearAuthCookies(res: express.Response) {
        res.clearCookie('access_token', { path: '/' });
        res.clearCookie('refresh_token', { path: '/' });
    }

    /**
     * Register a new user
     * Sets HttpOnly cookies with tokens
     */
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const result = await this.authService.register(dto);

        // Set tokens in HttpOnly cookies
        this.setAuthCookies(res, result.accessToken, result.refreshToken);

        // Return only user data (tokens NOT in response body for security)
        return {
            user: result.user,
            expiresIn: result.expiresIn,
        };
    }

    /**
     * Login with email and password
     * Sets HttpOnly cookies with tokens
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const result = await this.authService.login(dto);

        // Set tokens in HttpOnly cookies
        const rememberMe = (dto as any).rememberMe || false;
        this.setAuthCookies(res, result.accessToken, result.refreshToken, rememberMe);

        // Return only user data (tokens NOT in response body for security)
        return {
            user: result.user,
            expiresIn: result.expiresIn,
        };
    }

    /**
     * Refresh access token
     * Reads refresh token from cookie, sets new tokens
     */
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response,
        @Body() dto: RefreshTokenDto,
    ) {
        // Try to get refresh token from cookie first, then from body (backwards compatibility)
        const refreshToken = req.cookies?.refresh_token || dto.refreshToken;

        if (!refreshToken) {
            this.clearAuthCookies(res);
            return { error: 'No refresh token provided' };
        }

        const result = await this.authService.refreshToken(refreshToken);

        // Set new tokens in HttpOnly cookies
        this.setAuthCookies(res, result.accessToken, result.refreshToken);

        return {
            user: result.user,
            expiresIn: result.expiresIn,
        };
    }

    /**
     * Logout - Clear auth cookies
     */
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) res: express.Response) {
        this.clearAuthCookies(res);
        return { message: 'تم تسجيل الخروج بنجاح' };
    }

    /**
     * Get current user profile
     */
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async me(@CurrentUser('id') userId: string) {
        return this.authService.getUserById(userId);
    }

    /**
     * Change password
     */
    @Post('change-password')
    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async sendVerification(@CurrentUser('id') userId: string) {
        return this.authService.sendVerificationEmail(userId);
    }
}
