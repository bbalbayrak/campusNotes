import { Module } from '@nestjs/common';
import { GradingTermsService } from './grading-terms.service';
import { GradingTermsController } from './grading-terms.controller';

@Module({
  providers: [GradingTermsService],
  controllers: [GradingTermsController]
})
export class GradingTermsModule {}
