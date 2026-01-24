import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  IsPositive,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { CohortStatus } from '@prisma/client';

/**
 * DTO for creating a new cohort
 */
export class CreateCohortDto {
  @IsString()
  @IsNotEmpty({ message: 'معرف البرنامج مطلوب' })
  programId: string;

  @IsString()
  @IsNotEmpty({ message: 'اسم الدفعة بالعربية مطلوب' })
  @MinLength(3, { message: 'اسم الدفعة يجب أن يكون 3 أحرف على الأقل' })
  @MaxLength(200, { message: 'اسم الدفعة يجب أن لا يتجاوز 200 حرف' })
  nameAr: string;

  @IsString()
  @IsNotEmpty({ message: 'اسم الدفعة بالإنجليزية مطلوب' })
  @MinLength(3, { message: 'Cohort name must be at least 3 characters' })
  @MaxLength(200, { message: 'Cohort name must not exceed 200 characters' })
  nameEn: string;

  @IsDateString({}, { message: 'تاريخ البداية غير صالح' })
  startDate: string;

  @IsDateString({}, { message: 'تاريخ النهاية غير صالح' })
  endDate: string;

  @IsDateString({}, { message: 'تاريخ بداية التسجيل غير صالح' })
  registrationStartDate: string;

  @IsDateString({}, { message: 'تاريخ نهاية التسجيل غير صالح' })
  registrationEndDate: string;

  @IsInt({ message: 'السعة يجب أن تكون رقماً صحيحاً' })
  @IsPositive({ message: 'السعة يجب أن تكون رقماً موجباً' })
  capacity: number;

  @IsOptional()
  @IsString()
  instructorId?: string;

  @IsOptional()
  @IsString()
  blackboardCourseId?: string;
}

/**
 * DTO for updating an existing cohort
 */
export class UpdateCohortDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'اسم الدفعة يجب أن يكون 3 أحرف على الأقل' })
  @MaxLength(200, { message: 'اسم الدفعة يجب أن لا يتجاوز 200 حرف' })
  nameAr?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Cohort name must be at least 3 characters' })
  @MaxLength(200, { message: 'Cohort name must not exceed 200 characters' })
  nameEn?: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ البداية غير صالح' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ النهاية غير صالح' })
  endDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ بداية التسجيل غير صالح' })
  registrationStartDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ نهاية التسجيل غير صالح' })
  registrationEndDate?: string;

  @IsOptional()
  @IsInt({ message: 'السعة يجب أن تكون رقماً صحيحاً' })
  @IsPositive({ message: 'السعة يجب أن تكون رقماً موجباً' })
  capacity?: number;

  @IsOptional()
  @IsEnum(CohortStatus, { message: 'حالة الدفعة غير صالحة' })
  status?: CohortStatus;

  @IsOptional()
  @IsString()
  instructorId?: string;

  @IsOptional()
  @IsString()
  blackboardCourseId?: string;
}

/**
 * DTO for assigning an instructor to a cohort
 */
export class AssignInstructorDto {
  @IsString()
  @IsNotEmpty({ message: 'معرف المدرب مطلوب' })
  instructorId: string;
}
