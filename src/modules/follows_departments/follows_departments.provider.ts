import { FOLLOWS_DEPARTMENTS_REPOSITORY } from 'src/config/constants';
import { FollowsDepartments } from './follows_departments.entity';

export const FollowsDepartmentsProvider = [
  {
    provide: FOLLOWS_DEPARTMENTS_REPOSITORY,
    useValue: FollowsDepartments,
  },
];
