import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { InquirySubject } from '@prisma/client';

/**
 * DTO for submitting a contact inquiry
 * Used by public contact form (no auth required)
 */
export class CreateContactInquiryDto {
  @IsString()
  @IsNotEmpty({ message: 'الاسم مطلوب' })
  @MinLength(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' })
  @MaxLength(100, { message: 'الاسم يجب ألا يتجاوز 100 حرف' })
  name: string;

  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'رقم الجوال غير صالح' })
  phone?: string;

  @IsEnum(InquirySubject, { message: 'الموضوع غير صالح' })
  @IsNotEmpty({ message: 'الموضوع مطلوب' })
  subject: InquirySubject;

  @IsString()
  @IsNotEmpty({ message: 'الرسالة مطلوبة' })
  @MinLength(10, { message: 'الرسالة يجب أن تكون 10 أحرف على الأقل' })
  @MaxLength(5000, { message: 'الرسالة يجب ألا تتجاوز 5000 حرف' })
  message: string;
}

/**
 * Response after successful inquiry submission
 */
export class ContactInquiryResponseDto {
  id: string;
  message: string;
  submittedAt: Date;
}
