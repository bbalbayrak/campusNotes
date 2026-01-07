import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { subscriptionsProvider } from './subscriptions.provider';

@Module({
  providers: [SubscriptionsService, ...subscriptionsProvider],
  controllers: [SubscriptionsController],
})
export class SubscriptionsModule {}
