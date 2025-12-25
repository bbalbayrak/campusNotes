import { REPORT_REPOSITORY } from 'src/config/constants';
import { Report } from './reports.entity';

export const ReportsProvider = [
  {
    provide: REPORT_REPOSITORY,
    useValue: Report,
  },
];
