import { LECTURE_REPOSITORY } from 'src/config/constants';
import { Lecture } from './lectures.entity';

export const LecturesProvider = [
  {
    provide: LECTURE_REPOSITORY,
    useValue: Lecture,
  },
];
