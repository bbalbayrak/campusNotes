import { Module } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { LecturesController } from './lectures.controller';
import { LecturesProvider } from './lectures.provider';

@Module({
  providers: [LecturesService, ...LecturesProvider],
  controllers: [LecturesController],
})
export class LecturesModule {}
