import { Module } from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { UniversitiesController } from './universities.controller';
import { UniversitiesProvider } from './universities.provider';

@Module({
  providers: [UniversitiesService, ...UniversitiesProvider],
  controllers: [UniversitiesController],
})
export class UniversitiesModule {}
