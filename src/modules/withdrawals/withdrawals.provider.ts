import { WITHDRAWAL_REPOSITORY } from 'src/config/constants';
import { Withdrawal } from './withdrawals.entity';

export const WithdrawalsProvider = [
  {
    provide: WITHDRAWAL_REPOSITORY,
    useValue: Withdrawal,
  },
];
