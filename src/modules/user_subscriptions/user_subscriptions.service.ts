import { Inject, Injectable } from '@nestjs/common';
import { USER_SUBSCRIPTION_REPOSITORY } from 'src/config/constants';
import { UserSubscription } from './user_subscriptions.entity';
import { Op } from 'sequelize';

@Injectable()
export class UserSubscriptionsService {
  constructor(
    @Inject(USER_SUBSCRIPTION_REPOSITORY)
    private readonly userSubscriptionRepository: typeof UserSubscription,
  ) {}

  async getActiveSubscription(userId: number) {
    return this.userSubscriptionRepository.findOne({
      where: {
        user_id: userId,
        status: 'ACTIVE',
        expires_at: { [Op.gt]: new Date() },
      },
      order: [['expires_at', 'DESC']],
    });
  }

  async createSubscription(data: {
    userId: number;
    subscriptionId: number;
    durationDays: number;
    source: 'IAP' | 'ADMIN' | 'PROMO';
  }) {
    const now = new Date();
    const expires = new Date();
    expires.setDate(expires.getDate() + data.durationDays);

    await this.userSubscriptionRepository.update(
      { status: 'EXPIRED' },
      { where: { user_id: data.userId, status: 'ACTIVE' } },
    );

    return this.userSubscriptionRepository.create({
      user_id: data.userId,
      subscription_id: data.subscriptionId,
      status: 'ACTIVE',
      starts_at: now,
      expires_at: expires,
      source: data.source,
    });
  }
}
