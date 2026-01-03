import { Module } from '@nestjs/common';
import { FollowsLecturesService } from './follows_lectures.service';
import { FollowLecturesProvider } from './follow_lectures.provider';
import { LecturesModule } from '../lectures/lectures.module';

@Module({
  imports: [LecturesModule],
  providers: [FollowsLecturesService, ...FollowLecturesProvider],
  exports: [FollowsLecturesService],
})
export class FollowsLecturesModule {}
