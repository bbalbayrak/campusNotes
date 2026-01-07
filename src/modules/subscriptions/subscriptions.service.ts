import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY } from 'src/config/constants';
import { Subscriptions } from './subscriptions.entity';
import { SubscriptionType } from './subs.type';
import { CreateSubscriptionDto } from './dto/subs.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: typeof Subscriptions,
  ) {}

  async createSubscription(
    subData: CreateSubscriptionDto,
  ): Promise<Subscriptions> {
    return this.subscriptionRepository.create(subData);
  }

  async getAllActive(): Promise<Subscriptions[]> {
    return this.subscriptionRepository.findAll({
      where: { is_active: true },
      order: [['price', 'ASC']],
    });
  }

  async getBySubsType(subType: SubscriptionType): Promise<Subscriptions> {
    const sub = await this.subscriptionRepository.findOne({
      where: { subType: subType },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }
}
