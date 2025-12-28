import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class DepartmentDto {
  @IsNotEmpty({ message: 'name should not be empty' })
  @IsString({ message: 'name must be a string' })
  readonly name: string;
  @IsNotEmpty({ message: 'university_id should not be empty' })
  @IsInt({ message: 'university_id must be an integer' })
  readonly university_id: number;
}
