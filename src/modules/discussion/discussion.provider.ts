import {
  DISCUSSION_LIKE_REPOSITORY,
  DISCUSSION_REPOSITORY,
} from 'src/config/constants';
import { Discussion } from './discussion.entity';
import { DiscussionLike } from './discussion-like.entity';

export const DiscussionProvider = [
  {
    provide: DISCUSSION_REPOSITORY,
    useValue: Discussion,
  },
];

export const DiscussionLikeProvider = [
  {
    provide: DISCUSSION_LIKE_REPOSITORY,
    useValue: DiscussionLike,
  },
];
