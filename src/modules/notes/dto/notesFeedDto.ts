import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class NotesFeedDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  lectureId?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
