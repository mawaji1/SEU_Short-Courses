import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches, IsBoolean } from 'class-validator';

/**
 * Register User DTO
 */
export class RegisterDto {
    @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
    email: string;

    @IsString()
    @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
    @MaxLength(100)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم',
    })
    password: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    firstName: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName: string;

    @IsString()
    @IsOptional()
    @Matches(/^(\+?966|0)?5\d{8}$/, {
        message: 'رقم الجوال غير صالح',
    })
    phone?: string;
}

/**
 * Login DTO
 */
export class LoginDto {
    @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
    email: string;

    @IsString()
    @MinLength(1, { message: 'كلمة المرور مطلوبة' })
    password: string;

    @IsOptional()
    @IsBoolean()
    rememberMe?: boolean;
}

/**
 * Refresh Token DTO
 */
export class RefreshTokenDto {
    @IsOptional()
    @IsString()
    refreshToken?: string;
}

/**
 * Change Password DTO
 */
export class ChangePasswordDto {
    @IsString()
    @MinLength(1)
    currentPassword: string;

    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم',
    })
    newPassword: string;
}

/**
 * Auth Response
 */
export interface AuthResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

/**
 * Forgot Password DTO
 */
export class ForgotPasswordDto {
    @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
    email: string;
}

/**
 * Reset Password DTO
 */
export class ResetPasswordDto {
    @IsString()
    token: string;

    @IsString()
    @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم',
    })
    newPassword: string;
}
