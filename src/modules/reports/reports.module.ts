import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportsProvider } from './reports.provider';

@Module({
  providers: [ReportsService, ...ReportsProvider],
  controllers: [ReportsController],
})
export class ReportsModule {}
