import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { subscriptionsProvider } from './subscriptions.provider';
import { AppleJwtVerifierService } from './apple-jwt-verifier.service';
import { SubscriptionCronService } from './subscription-cron.service';
import { SubscriptionWebhookController } from './subscription-webhook.controller';
import { HttpModule } from '@nestjs/axios';
import { UsersProvider } from '../users/users.provider';
import { UserSubscriptionsProvider } from '../user_subscriptions/user_subscriptions.provider';
import { SubscriptionSeederController } from './subscription-seeder.controller';
import { SubscriptionSeederService } from './subscription-seeder.service';

@Module({
  imports: [HttpModule],
  providers: [
    SubscriptionsService,
    ...subscriptionsProvider,
    AppleJwtVerifierService,
    SubscriptionCronService,
    ...UsersProvider,
    ...UserSubscriptionsProvider,
    SubscriptionSeederService,
  ],
  controllers: [
    SubscriptionsController,
    SubscriptionWebhookController,
    SubscriptionSeederController,
  ],
})
export class SubscriptionsModule {}
