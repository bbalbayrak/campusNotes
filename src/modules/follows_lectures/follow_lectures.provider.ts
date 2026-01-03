import { FOLLOWS_LECTURES_REPOSITORY } from 'src/config/constants';
import { FollowLecture } from './follow_lectures.entity';

export const FollowLecturesProvider = [
  {
    provide: FOLLOWS_LECTURES_REPOSITORY,
    useValue: FollowLecture,
  },
];
