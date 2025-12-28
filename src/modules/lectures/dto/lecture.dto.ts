import {
  IsNumber,
  IsString,
  IsOptional,
  IsInt,
  IsNotEmpty,
} from 'class-validator';

export class LectureDto {
  @IsInt({ message: 'department_id must be an integer' })
  @IsNotEmpty({ message: 'department_id should not be empty' })
  readonly department_id: number;

  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name should not be empty' })
  readonly name: string;

  @IsString({ message: 'semester must be a string' })
  @IsNotEmpty({ message: 'semester should not be empty' })
  readonly semester: string;

  @IsOptional({ message: 'grade is optional' })
  @IsString({ message: 'grade must be a string' })
  readonly grade?: string;
}
