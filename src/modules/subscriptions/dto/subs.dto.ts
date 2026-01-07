import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { SubscriptionType } from '../subs.type';

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionType, { message: 'Invalid subscription type' })
  @IsNotEmpty({ message: 'Subscription type is required' })
  readonly type: SubscriptionType;
  @IsNotEmpty({ message: 'Price is required' })
  @IsInt({ message: 'Price must be an integer' })
  readonly price: number;
  @IsNotEmpty({ message: 'Currency is required' })
  @IsString({ message: 'Currency must be a string' })
  readonly currency: string;
  @IsNotEmpty({ message: 'Duration (in days) is required' })
  @IsInt({ message: 'Duration must be an integer' })
  readonly duration_days: number;
  @IsNotEmpty({ message: 'Uploader share percent is required' })
  @IsInt({ message: 'Uploader share percent must be an integer' })
  readonly uploader_share_percent: number;
  @IsNotEmpty({ message: 'Platform cut percent is required' })
  @IsInt({ message: 'Platform cut percent must be an integer' })
  readonly platform_cut_percent: number;
  @IsOptional({ message: 'Active status is optional' })
  @IsBoolean({ message: 'Active status must be a boolean' })
  readonly is_active: boolean;
}
