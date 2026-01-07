import { SUBSCRIPTION_REPOSITORY } from 'src/config/constants';
import { Subscriptions } from './subscriptions.entity';

export const subscriptionsProvider = [
  {
    provide: SUBSCRIPTION_REPOSITORY,
    useValue: Subscriptions,
  },
];
