import { IsString, IsNotEmpty } from 'class-validator';

export class MapCourseDto {
  @IsString()
  @IsNotEmpty()
  cohortId: string;

  @IsString()
  @IsNotEmpty()
  blackboardCourseId: string;
}
