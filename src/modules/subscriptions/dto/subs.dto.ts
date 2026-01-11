import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { UserPlanType } from 'src/modules/users/userTypes';

export class ActivateSubscriptionDto {
  @IsNotEmpty({ message: 'Subscription type is required' })
  @IsEnum(UserPlanType, { message: 'Invalid subscription type' })
  subscriptionType: UserPlanType;

  @IsNotEmpty({ message: 'Platform is required' })
  @IsEnum(['apple', 'google'], { message: 'Platform must be apple or google' })
  platform: 'apple' | 'google';

  @IsNotEmpty({ message: 'Receipt data is required' })
  @IsString({ message: 'Receipt data must be a string' })
  receiptData: string;

  @IsNotEmpty({ message: 'Product ID is required' })
  @IsString({ message: 'Product ID must be a string' })
  productId: string;

  @IsOptional()
  @IsString({ message: 'Transaction ID must be a string' })
  transactionId?: string;
}

export class CancelSubscriptionDto {
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  reason?: string;
}

export class VerifyReceiptDto {
  @IsNotEmpty({ message: 'Platform is required' })
  @IsEnum(['apple', 'google'], { message: 'Platform must be apple or google' })
  platform: 'apple' | 'google';

  @IsNotEmpty({ message: 'Receipt data is required' })
  @IsString({ message: 'Receipt data must be a string' })
  receiptData: string;

  @IsNotEmpty({ message: 'Product ID is required' })
  @IsString({ message: 'Product ID must be a string' })
  productId: string;
}

export class GrantSubscriptionDto {
  @IsNotEmpty({ message: 'Subscription type is required' })
  @IsEnum(UserPlanType, { message: 'Invalid subscription type' })
  subscriptionType: UserPlanType;

  @IsNotEmpty({ message: 'Duration is required' })
  duration_days: number;
}
