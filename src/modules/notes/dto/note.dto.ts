import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { NoteFileType } from '../noteFile.type';

export class NoteDto {
  @IsNotEmpty({ message: 'Author ID is required' })
  @IsInt({ message: 'Author ID must be an integer' })
  readonly authorId: number;

  @IsNotEmpty({ message: 'Lecture ID is required' })
  @IsInt({ message: 'Lecture ID must be an integer' })
  readonly lectureId: number;

  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  readonly title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  readonly description?: string;

  @IsNotEmpty({ message: 'File URL is required' })
  @IsString({ message: 'File URL must be a string' })
  readonly fileUrl: string;

  @IsNotEmpty({ message: 'File type is required' })
  @IsEnum(NoteFileType, {
    message: 'File type must be pdf, jpg, jpeg, png or webp',
  })
  readonly fileType: NoteFileType;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  readonly price?: number;

  @IsOptional()
  @IsInt({ message: 'View count must be an integer' })
  @Min(0)
  readonly viewCount?: number;

  @IsOptional()
  @IsInt({ message: 'Download count must be an integer' })
  @Min(0)
  readonly downloadCount?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Average rating must be a number' })
  @Min(0)
  readonly averageRating?: number;

  @IsNotEmpty({ message: 'isFree is required' })
  @IsBoolean({ message: 'isFree must be a boolean' })
  readonly isFree: boolean;

  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  readonly status?: string;
}
