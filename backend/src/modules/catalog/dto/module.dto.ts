import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Create Program Module DTO
 */
export class CreateModuleDto {
  @IsString()
  programId: string;

  @IsString()
  @MaxLength(200)
  titleAr: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  titleEn?: string;

  @IsString()
  @IsOptional()
  descriptionAr?: string;

  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  durationHours?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;
}

/**
 * Update Program Module DTO
 */
export class UpdateModuleDto {
  @IsString()
  @MaxLength(200)
  @IsOptional()
  titleAr?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  titleEn?: string;

  @IsString()
  @IsOptional()
  descriptionAr?: string;

  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  durationHours?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;
}

/**
 * Create Session DTO
 */
export class CreateSessionDto {
  @IsString()
  moduleId: string;

  @IsString()
  @MaxLength(200)
  titleAr: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  titleEn?: string;

  @IsString()
  @IsOptional()
  descriptionAr?: string;

  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  durationMinutes?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;
}

/**
 * Update Session DTO
 */
export class UpdateSessionDto {
  @IsString()
  @MaxLength(200)
  @IsOptional()
  titleAr?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  titleEn?: string;

  @IsString()
  @IsOptional()
  descriptionAr?: string;

  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  durationMinutes?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;
}
