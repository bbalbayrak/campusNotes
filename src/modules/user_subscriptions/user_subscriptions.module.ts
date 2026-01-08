import { Module } from '@nestjs/common';
import { UserSubscriptionsService } from './user_subscriptions.service';
import { UserSubscriptionsController } from './user_subscriptions.controller';
import { UserSubscriptionsProvider } from './user_subscriptions.provider';

@Module({
  providers: [UserSubscriptionsService, ...UserSubscriptionsProvider],
  controllers: [UserSubscriptionsController],
  exports: [UserSubscriptionsService],
})
export class UserSubscriptionsModule {}
