import { DISCUSSION_REPOSITORY } from 'src/config/constants';
import { Discussion } from './discussion.entity';

export const DiscussionProvider = [
  {
    provide: DISCUSSION_REPOSITORY,
    useValue: Discussion,
  },
];
