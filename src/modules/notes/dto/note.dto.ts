import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNoteDto {
  @IsNotEmpty({ message: 'Author ID is required' })
  @Type(() => Number)
  @IsInt({ message: 'Author ID must be an integer' })
  authorId: number;

  @IsNotEmpty({ message: 'Lecture ID is required' })
  @Type(() => Number)
  @IsInt({ message: 'Lecture ID must be an integer' })
  lectureId: number;

  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0)
  price?: number;

  @IsNotEmpty({ message: 'isFree flag is required' })
  @Type(() => Boolean)
  @IsBoolean({ message: 'isFree must be a boolean' })
  isFree: boolean;
}
