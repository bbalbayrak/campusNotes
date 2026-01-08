import { EARNINGS_REPOSITORY } from 'src/config/constants';
import { Earnings } from './earnings.entity';

export const EarningsProvider = [
  {
    provide: EARNINGS_REPOSITORY,
    useValue: Earnings,
  },
];
