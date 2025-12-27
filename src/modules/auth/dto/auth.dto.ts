import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsString({
    message: 'Email must be a string',
  })
  @IsNotEmpty({
    message: 'Email is required',
  })
  readonly email: string;
  @IsString({
    message: 'Password must be a string',
  })
  @IsNotEmpty({
    message: 'Email is required',
  })
  readonly password: string;
}
