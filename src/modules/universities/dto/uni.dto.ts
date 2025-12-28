import { IsNotEmpty, IsString } from 'class-validator';

export class UniDto {
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name should not be empty' })
  readonly name: string;
  @IsString({ message: 'country must be a string' })
  @IsNotEmpty({ message: 'country should not be empty' })
  readonly country: string;
}
