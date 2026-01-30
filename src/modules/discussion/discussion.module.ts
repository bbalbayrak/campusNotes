import { Module } from '@nestjs/common';
import { DiscussionService } from './discussion.service';
import { DiscussionController } from './discussion.controller';
import {
  DiscussionLikeProvider,
  DiscussionProvider,
} from './discussion.provider';

@Module({
  providers: [
    DiscussionService,
    ...DiscussionProvider,
    ...DiscussionLikeProvider,
  ],
  controllers: [DiscussionController],
})
export class DiscussionModule {}
