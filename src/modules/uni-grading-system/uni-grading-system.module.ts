import { Module } from '@nestjs/common';
import { GradingService } from './uni-grading-system.service';
import { GradingController } from './uni-grading-system.controller';

@Module({
  providers: [GradingService],
  controllers: [GradingController],
})
export class UniGradingSystemModule {}
