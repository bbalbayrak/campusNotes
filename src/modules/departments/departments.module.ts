import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { DepartmentsProvider } from './departments.provider';

@Module({
  providers: [DepartmentsService, ...DepartmentsProvider],
  controllers: [DepartmentsController],
})
export class DepartmentsModule {}
