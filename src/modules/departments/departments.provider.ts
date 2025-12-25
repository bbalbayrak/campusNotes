import { DEPARTMENT_REPOSITORY } from 'src/config/constants';
import { Department } from './departments.entity';

export const DepartmentsProvider = [
  {
    provide: DEPARTMENT_REPOSITORY,
    useValue: Department,
  },
];
