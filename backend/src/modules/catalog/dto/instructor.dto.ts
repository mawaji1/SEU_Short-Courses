import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

/**
 * Create Instructor DTO
 */
export class CreateInstructorDto {
  @IsString()
  nameAr: string;

  @IsString()
  nameEn: string;

  @IsString()
  titleAr: string;

  @IsString()
  titleEn: string;

  @IsString()
  @IsOptional()
  bioAr?: string;

  @IsString()
  @IsOptional()
  bioEn?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

/**
 * Update Instructor DTO
 */
export class UpdateInstructorDto {
  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsString()
  @IsOptional()
  nameEn?: string;

  @IsString()
  @IsOptional()
  titleAr?: string;

  @IsString()
  @IsOptional()
  titleEn?: string;

  @IsString()
  @IsOptional()
  bioAr?: string;

  @IsString()
  @IsOptional()
  bioEn?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
