import { FOLLOWS_USERS_REPOSITORY } from 'src/config/constants';
import { FollowsUsers } from './follows_users.entity';

export const FollowsUsersProvider = [
  {
    provide: FOLLOWS_USERS_REPOSITORY,
    useValue: FollowsUsers,
  },
];
