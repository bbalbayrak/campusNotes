import { UNIVERSITY_REPOSITORY } from 'src/config/constants';
import { University } from './universities.entity';

export const UniversitiesProvider = [
  {
    provide: UNIVERSITY_REPOSITORY,
    useValue: University,
  },
];
