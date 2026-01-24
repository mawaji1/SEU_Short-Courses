import { IsString, IsOptional, IsInt, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Create Category DTO
 */
export class CreateCategoryDto {
  @IsString()
  nameAr: string;

  @IsString()
  nameEn: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

/**
 * Update Category DTO
 */
export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsString()
  @IsOptional()
  nameEn?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
