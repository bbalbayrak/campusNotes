import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { DepartmentsProvider } from './departments.provider';
import { UniversitiesModule } from '../universities/universities.module';

@Module({
  imports: [UniversitiesModule],
  providers: [DepartmentsService, ...DepartmentsProvider],
  controllers: [DepartmentsController],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
