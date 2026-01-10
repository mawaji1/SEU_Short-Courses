import {
    IsString,
    IsOptional,
    IsInt,
    IsBoolean,
    IsNumber,
    IsEnum,
    IsArray,
    Min,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ProgramStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}

export enum ProgramType {
    COURSE = 'COURSE',
    WORKSHOP = 'WORKSHOP',
    BOOTCAMP = 'BOOTCAMP',
    CERTIFICATION = 'CERTIFICATION',
}

export enum DeliveryMode {
    ONLINE = 'ONLINE',
    IN_PERSON = 'IN_PERSON',
    HYBRID = 'HYBRID',
}

/**
 * Create Program DTO
 */
export class CreateProgramDto {
    @IsString()
    @MaxLength(200)
    titleAr: string;

    @IsString()
    @MaxLength(200)
    titleEn: string;

    @IsString()
    descriptionAr: string;

    @IsString()
    descriptionEn: string;

    @IsString()
    @MaxLength(500)
    shortDescriptionAr: string;

    @IsString()
    @MaxLength(500)
    shortDescriptionEn: string;

    @IsString()
    slug: string;

    @IsEnum(ProgramType)
    @IsOptional()
    type?: ProgramType;

    @IsEnum(DeliveryMode)
    @IsOptional()
    deliveryMode?: DeliveryMode;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    durationHours: number;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price: number;

    @IsString()
    categoryId: string;

    @IsString()
    @IsOptional()
    instructorId?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    prerequisitesAr?: string;

    @IsString()
    @IsOptional()
    prerequisitesEn?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    learningOutcomesAr?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    learningOutcomesEn?: string[];

    @IsString()
    @IsOptional()
    targetAudienceAr?: string;

    @IsString()
    @IsOptional()
    targetAudienceEn?: string;

    @IsString()
    @IsOptional()
    blackboardCourseId?: string;

    @IsBoolean()
    @IsOptional()
    isFeatured?: boolean;
}

/**
 * Update Program DTO
 */
export class UpdateProgramDto {
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

    @IsString()
    @MaxLength(500)
    @IsOptional()
    shortDescriptionAr?: string;

    @IsString()
    @MaxLength(500)
    @IsOptional()
    shortDescriptionEn?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsEnum(ProgramType)
    @IsOptional()
    type?: ProgramType;

    @IsEnum(DeliveryMode)
    @IsOptional()
    deliveryMode?: DeliveryMode;

    @IsInt()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    durationHours?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    price?: number;

    @IsEnum(ProgramStatus)
    @IsOptional()
    status?: ProgramStatus;

    @IsString()
    @IsOptional()
    categoryId?: string;

    @IsString()
    @IsOptional()
    instructorId?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    prerequisitesAr?: string;

    @IsString()
    @IsOptional()
    prerequisitesEn?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    learningOutcomesAr?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    learningOutcomesEn?: string[];

    @IsString()
    @IsOptional()
    targetAudienceAr?: string;

    @IsString()
    @IsOptional()
    targetAudienceEn?: string;

    @IsString()
    @IsOptional()
    blackboardCourseId?: string;

    @IsBoolean()
    @IsOptional()
    isFeatured?: boolean;

    @IsInt()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    sortOrder?: number;
}

/**
 * Program Query DTO
 */
export class ProgramQueryDto {
    @IsInt()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @IsInt()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    limit?: number = 10;

    @IsString()
    @IsOptional()
    categoryId?: string;

    @IsEnum(ProgramStatus)
    @IsOptional()
    status?: ProgramStatus;

    @IsEnum(ProgramType)
    @IsOptional()
    type?: ProgramType;

    @IsString()
    @IsOptional()
    search?: string;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    isFeatured?: boolean;

    @IsString()
    @IsOptional()
    sortBy?: string = 'createdAt';

    @IsString()
    @IsOptional()
    sortOrder?: 'asc' | 'desc' = 'desc';
}
