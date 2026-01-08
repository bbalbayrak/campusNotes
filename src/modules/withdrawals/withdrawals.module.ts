import { Module } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalsProvider } from './withdrawals.provider';

@Module({
  providers: [WithdrawalsService, ...WithdrawalsProvider],
  controllers: [WithdrawalsController],
})
export class WithdrawalsModule {}
