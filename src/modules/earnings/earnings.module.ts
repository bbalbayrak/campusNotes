import { Module } from '@nestjs/common';
import { EarningsService } from './earnings.service';
import { EarningsController } from './earnings.controller';

@Module({
  providers: [EarningsService],
  controllers: [EarningsController]
})
export class EarningsModule {}
