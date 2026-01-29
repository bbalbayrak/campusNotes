import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsIn,
  IsObject,
  ValidateNested,
  IsOptional,
  IsEmail,
  Matches,
  Min,
  MaxLength,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentDetailsDto {
  @IsNotEmpty({ message: 'Amount is required.' })
  @IsNumber({}, { message: 'Amount should be a number.' })
  @Min(50, { message: 'Amount must be at least 50.' })
  amount: number;

  @IsNotEmpty({ message: 'Payment method is required.' })
  @IsString({ message: 'Payment method should be a string.' })
  payment_method: string;

  @IsOptional()
  @IsString({ message: 'Bank name should be a string.' })
  @MaxLength(100, { message: 'Bank name can be at most 100 characters.' })
  bank_name?: string;

  @IsOptional()
  @IsString({ message: 'Account holder name should be a string.' })
  @MaxLength(100, {
    message: 'Account holder name can be at most 100 characters.',
  })
  account_holder?: string;

  @IsOptional()
  @IsString({ message: 'IBAN should be a string.' })
  @Matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/, {
    message: 'You should enter a valid IBAN.',
  })
  iban?: string;

  @IsOptional()
  @IsString({ message: 'SWIFT code should be a string.' })
  @Length(8, 11, { message: 'SWIFT code must be between 8 and 11 characters.' })
  swift?: string;

  @IsOptional()
  @IsEmail({}, { message: 'You should enter a valid email address.' })
  @MaxLength(100, { message: 'Email can be at most 100 characters.' })
  paypal_email?: string;
}

export class RequestWithdrawalDto {
  @IsNotEmpty({ message: 'Amount is required.' })
  @IsNumber({}, { message: 'Amount should be a number.' })
  @Min(1, { message: 'Amount must be at least 1.' })
  amount: number;

  @IsNotEmpty({ message: 'Payment method is required.' })
  @IsString({ message: 'Payment method should be a string.' })
  @IsIn(['BANK_TRANSFER', 'PAYPAL', 'CRYPTO', 'OTHER'], {
    message: 'Please select a valid payment method.',
  })
  payment_method: string;

  @IsNotEmpty({ message: 'Payment details are required.' })
  @IsObject({ message: 'Payment details should be an object.' })
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  payment_details: PaymentDetailsDto;
}

export class ApproveWithdrawalDto {
  @IsNotEmpty({ message: 'Transaction reference is required.' })
  @IsString({ message: 'Transaction reference should be a string.' })
  @Matches(/^[a-zA-Z0-9\-_]+$/, {
    message: 'Please enter a valid transaction reference.',
  })
  transaction_reference: string;
}

export class RejectWithdrawalDto {
  @IsNotEmpty({ message: 'Rejection reason is required.' })
  @IsString({ message: 'Rejection reason should be a string.' })
  @MaxLength(500, {
    message: 'Rejection reason can be at most 500 characters.',
  })
  rejection_reason: string;
}
