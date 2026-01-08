import { USER_SUBSCRIPTION_REPOSITORY } from 'src/config/constants';
import { Subscriptions } from '../subscriptions/subscriptions.entity';

export const UserSubscriptionsProvider = [
  {
    provide: USER_SUBSCRIPTION_REPOSITORY,
    useValue: Subscriptions,
  },
];
