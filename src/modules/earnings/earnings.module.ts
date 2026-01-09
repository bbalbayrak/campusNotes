import { Module } from '@nestjs/common';
import { EarningsService } from './earnings.service';
import { EarningsController } from './earnings.controller';
import { UsersModule } from '../users/users.module';
import { EarningsProvider } from './earnings.provider';

@Module({
  imports: [UsersModule],
  providers: [EarningsService, ...EarningsProvider],
  controllers: [EarningsController],
  exports: [EarningsService],
})
export class EarningsModule {}
