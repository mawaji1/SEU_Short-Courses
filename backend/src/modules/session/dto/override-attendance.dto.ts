import { IsString, IsBoolean, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OverrideAttendanceDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsBoolean()
  present: boolean;
}

export class BulkOverrideAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceUpdateItem)
  updates: AttendanceUpdateItem[];
}

class AttendanceUpdateItem {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsBoolean()
  present: boolean;
}
