import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  cohortId: string;

  @IsString()
  @IsNotEmpty()
  instructorId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startTime: string;

  @IsInt()
  @Min(15) // Minimum 15 minutes
  @Max(480) // Maximum 8 hours
  duration: number;
}
