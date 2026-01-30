import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateDiscussionDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  description: string;

  @IsNotEmpty({ message: 'Department ID is required' })
  @IsInt({ message: 'Department ID must be an integer' })
  department_id: number;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  tags?: string[];
}

export class UpdateDiscussionDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  tags?: string[];
}

export class DiscussionFiltersDto {
  @IsOptional()
  @IsInt({ message: 'Department ID must be an integer' })
  department_id?: number;

  @IsOptional()
  @IsInt({ message: 'Lecture ID must be an integer' })
  lecture_id?: number;

  @IsOptional()
  @IsString({ message: 'Search query must be a string' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'Sort must be a string' })
  sort?: 'recent' | 'popular' | 'most_commented';

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  tags?: string[];

  @IsOptional()
  @IsInt({ message: 'Page must be an integer' })
  page?: number;

  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  limit?: number;
}
