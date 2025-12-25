import { Module } from '@nestjs/common';
import { FollowsLecturesService } from './follows_lectures.service';

@Module({
  providers: [FollowsLecturesService]
})
export class FollowsLecturesModule {}
