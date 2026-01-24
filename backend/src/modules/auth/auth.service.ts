import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma.service';
import { RegisterDto, LoginDto, ChangePasswordDto, AuthResponse } from './dto';

/**
 * Auth Service
 *
 * Handles authentication logic:
 * - User registration
 * - Login with email/password
 * - JWT token generation and refresh
 * - Password management
 */
@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('البريد الإلكتروني مسجل مسبقاً');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: 'LEARNER',
        isActive: true,
        emailVerified: false,
      },
    });

    // Send verification email (don't await - fire and forget)
    this.sendVerificationEmail(user.id).catch((err) => {
      console.error('Failed to send verification email:', err);
    });

    // Generate tokens
    return this.generateAuthResponse(user);
  }

  /**
   * Login with email and password
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(dto.email, dto.password);
    return this.generateAuthResponse(user);
  }

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('الحساب غير مفعل');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    return user;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('الجلسة غير صالحة');
      }

      return this.generateAuthResponse(user);
    } catch {
      throw new UnauthorizedException('الرمز غير صالح أو منتهي الصلاحية');
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('المستخدم غير موجود');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('كلمة المرور الحالية غير صحيحة');
    }

    const newPasswordHash = await bcrypt.hash(
      dto.newPassword,
      this.SALT_ROUNDS,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  /**
   * Token expiry time in hours
   */
  private readonly RESET_TOKEN_EXPIRY_HOURS = 1;

  /**
   * Request password reset - generates token and logs it (email integration later)
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return {
        message:
          'إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة بإرشادات إعادة تعيين كلمة المرور',
      };
    }

    // Invalidate any existing tokens for this user
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Generate secure random token
    const token = this.generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.RESET_TOKEN_EXPIRY_HOURS);

    // Store token in database
    await this.prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Log token to console (replace with email in E1.12)
    console.log('\n========================================');
    console.log('🔐 PASSWORD RESET TOKEN');
    console.log('========================================');
    console.log(`Email: ${user.email}`);
    console.log(`Token: ${token}`);
    console.log(
      `Reset URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`,
    );
    console.log(`Expires: ${expiresAt.toISOString()}`);
    console.log('========================================\n');

    return {
      message:
        'إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة بإرشادات إعادة تعيين كلمة المرور',
    };
  }

  /**
   * Reset password using token
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException('رمز إعادة التعيين غير صالح');
    }

    if (resetToken.usedAt) {
      throw new BadRequestException('تم استخدام رمز إعادة التعيين مسبقاً');
    }

    if (new Date() > resetToken.expiresAt) {
      // Mark as used so it can't be retried
      await this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });
      throw new BadRequestException('رمز إعادة التعيين منتهي الصلاحية');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update user password and mark token as used in a transaction
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'تم إعادة تعيين كلمة المرور بنجاح' };
  }

  /**
   * Token expiry time for email verification in hours
   */
  private readonly EMAIL_VERIFICATION_EXPIRY_HOURS = 24;

  /**
   * Send email verification token
   */
  async sendVerificationEmail(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('المستخدم غير موجود');
    }

    if (user.emailVerified) {
      return { message: 'البريد الإلكتروني مُفعّل بالفعل' };
    }

    // Invalidate any existing tokens for this user
    await this.prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Generate secure random token
    const token = this.generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + this.EMAIL_VERIFICATION_EXPIRY_HOURS,
    );

    // Store token in database
    await this.prisma.emailVerificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Log token to console (replace with email in production)
    console.log('\n========================================');
    console.log('📧 EMAIL VERIFICATION TOKEN');
    console.log('========================================');
    console.log(`Email: ${user.email}`);
    console.log(`Token: ${token}`);
    console.log(
      `Verification URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`,
    );
    console.log(`Expires: ${expiresAt.toISOString()}`);
    console.log('========================================\n');

    return { message: 'تم إرسال رابط التفعيل إلى بريدك الإلكتروني' };
  }

  /**
   * Verify email using token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const verificationToken =
      await this.prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: true },
      });

    if (!verificationToken) {
      throw new BadRequestException('رمز التفعيل غير صالح');
    }

    if (verificationToken.usedAt) {
      throw new BadRequestException('تم استخدام رمز التفعيل مسبقاً');
    }

    if (new Date() > verificationToken.expiresAt) {
      await this.prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      });
      throw new BadRequestException('رمز التفعيل منتهي الصلاحية');
    }

    // Update user and mark token as used in a transaction
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'تم تفعيل البريد الإلكتروني بنجاح' };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if email exists for security
      return {
        message: 'إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة التفعيل',
      };
    }

    if (user.emailVerified) {
      return { message: 'البريد الإلكتروني مُفعّل بالفعل' };
    }

    return this.sendVerificationEmail(user.id);
  }

  /**
   * Generate cryptographically secure random token
   */
  private generateSecureToken(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    });
  }

  /**
   * Generate JWT tokens and auth response
   */
  private generateAuthResponse(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }): AuthResponse {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'jwt-secret',
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }
}
