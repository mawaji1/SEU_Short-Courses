import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  IsPositive,
  IsEnum,
  IsNumber,
  IsBoolean,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { PromoCodeType } from '@prisma/client';
import { Transform } from 'class-transformer';

/**
 * DTO for creating a new promo code
 */
export class CreatePromoCodeDto {
  @IsString()
  @IsNotEmpty({ message: 'رمز الخصم مطلوب' })
  @MinLength(3, { message: 'رمز الخصم يجب أن يكون 3 أحرف على الأقل' })
  @MaxLength(50, { message: 'رمز الخصم يجب أن لا يتجاوز 50 حرف' })
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'رمز الخصم يجب أن يحتوي على أحرف إنجليزية كبيرة وأرقام فقط',
  })
  @Transform(({ value }) => value?.toUpperCase())
  code: string;

  @IsEnum(PromoCodeType, { message: 'نوع الخصم غير صالح' })
  type: PromoCodeType;

  @IsNumber({}, { message: 'قيمة الخصم يجب أن تكون رقماً' })
  @IsPositive({ message: 'قيمة الخصم يجب أن تكون رقماً موجباً' })
  value: number;

  @IsOptional()
  @IsInt({ message: 'الحد الأقصى للاستخدام يجب أن يكون رقماً صحيحاً' })
  @IsPositive({ message: 'الحد الأقصى للاستخدام يجب أن يكون رقماً موجباً' })
  maxUses?: number;

  @IsOptional()
  @IsNumber({}, { message: 'الحد الأدنى للشراء يجب أن يكون رقماً' })
  @Min(0, { message: 'الحد الأدنى للشراء يجب أن يكون صفراً أو أكبر' })
  minPurchase?: number;

  @IsOptional()
  @IsNumber({}, { message: 'الحد الأقصى للخصم يجب أن يكون رقماً' })
  @IsPositive({ message: 'الحد الأقصى للخصم يجب أن يكون رقماً موجباً' })
  maxDiscount?: number;

  @IsOptional()
  @IsString()
  programId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ البداية غير صالح' })
  validFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ النهاية غير صالح' })
  validUntil?: string;

  @IsOptional()
  @IsBoolean({ message: 'حالة التفعيل يجب أن تكون صحيحة أو خاطئة' })
  isActive?: boolean;
}

/**
 * DTO for updating an existing promo code
 */
export class UpdatePromoCodeDto {
  @IsOptional()
  @IsEnum(PromoCodeType, { message: 'نوع الخصم غير صالح' })
  type?: PromoCodeType;

  @IsOptional()
  @IsNumber({}, { message: 'قيمة الخصم يجب أن تكون رقماً' })
  @IsPositive({ message: 'قيمة الخصم يجب أن تكون رقماً موجباً' })
  value?: number;

  @IsOptional()
  @IsInt({ message: 'الحد الأقصى للاستخدام يجب أن يكون رقماً صحيحاً' })
  @IsPositive({ message: 'الحد الأقصى للاستخدام يجب أن يكون رقماً موجباً' })
  maxUses?: number;

  @IsOptional()
  @IsNumber({}, { message: 'الحد الأدنى للشراء يجب أن يكون رقماً' })
  @Min(0, { message: 'الحد الأدنى للشراء يجب أن يكون صفراً أو أكبر' })
  minPurchase?: number;

  @IsOptional()
  @IsNumber({}, { message: 'الحد الأقصى للخصم يجب أن يكون رقماً' })
  @IsPositive({ message: 'الحد الأقصى للخصم يجب أن يكون رقماً موجباً' })
  maxDiscount?: number;

  @IsOptional()
  @IsString()
  programId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ البداية غير صالح' })
  validFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ النهاية غير صالح' })
  validUntil?: string;

  @IsOptional()
  @IsBoolean({ message: 'حالة التفعيل يجب أن تكون صحيحة أو خاطئة' })
  isActive?: boolean;
}
