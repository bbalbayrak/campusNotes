import { USER_SUBSCRIPTION_REPOSITORY } from 'src/config/constants';
import { UserSubscription } from './user_subscriptions.entity';

export const UserSubscriptionsProvider = [
  {
    provide: USER_SUBSCRIPTION_REPOSITORY,
    useValue: UserSubscription,
  },
];
