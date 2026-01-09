import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsInt,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserPlanType, UserType } from '../userTypes';

export class UserDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  readonly name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  readonly email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  readonly password: string;

  @IsOptional()
  @IsInt({ message: 'University ID must be an integer' })
  readonly university_id?: number;

  @IsOptional()
  @IsInt({ message: 'Department ID must be an integer' })
  readonly department_id?: number;

  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(UserType, {
    message: 'User Role must be either Student, Professor, Moderator, or Admin',
  })
  readonly role: UserType;

  @IsOptional()
  @IsBoolean({ message: 'Verified must be a boolean' })
  readonly verified?: boolean;

  @IsOptional()
  @IsInt({ message: 'Trust score must be an integer' })
  readonly trust_score?: number;

  @IsNotEmpty({ message: 'Plan type is required' })
  @IsEnum([...Object.values(UserPlanType)], {
    message: 'Plan type must be either FREE or PREMIUM',
  })
  readonly plan_type: UserPlanType;
}
