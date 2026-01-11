import { Inject, Injectable, Logger } from '@nestjs/common';
import { Subscriptions } from '../subscriptions/subscriptions.entity';
import { SubscriptionType } from '../subscriptions/subs.type';
import { SUBSCRIPTION_REPOSITORY } from 'src/config/constants';

@Injectable()
export class SubscriptionSeederService {
  private readonly logger = new Logger(SubscriptionSeederService.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionModel: typeof Subscriptions,
  ) {}

  async seedSubscriptions() {
    this.logger.log('Seeding subscription plans...');

    const plans = [
      {
        subType: SubscriptionType.FREE,
        price: 0,
        currency: 'TRY',
        duration_days: 365, // Free is permanent but we set a year
        uploader_share_percent: 60,
        platform_cut_percent: 40,
        apple_product_id: null, // Free doesn't need product ID
        google_product_id: null,
        features: JSON.stringify([
          'Upload notes',
          'Purchase notes',
          'Basic search',
          '60% revenue share',
        ]),
        is_active: true,
      },
      {
        subType: SubscriptionType.PRO,
        price: 149,
        currency: 'TRY',
        duration_days: 30, // Monthly
        uploader_share_percent: 85,
        platform_cut_percent: 15,
        apple_product_id: 'com.campusnotes.propass.monthly', // Replace with your actual product ID
        google_product_id: 'propass_monthly', // Replace with your actual product ID
        features: JSON.stringify([
          'All FREE features',
          'Priority upload review',
          'Advanced analytics',
          '85% revenue share',
          'Reduced platform fees',
          'Early access to features',
        ]),
        is_active: true,
      },
      {
        subType: SubscriptionType.LEGEND,
        price: 499,
        currency: 'TRY',
        duration_days: 30, // Monthly
        uploader_share_percent: 95,
        platform_cut_percent: 5,
        apple_product_id: 'com.campusnotes.legend.monthly', // Replace with your actual product ID
        google_product_id: 'legend_monthly', // Replace with your actual product ID
        features: JSON.stringify([
          'All PRO PASS features',
          'Premium badge',
          'Featured listings',
          '95% revenue share',
          'Minimal platform fees',
          'Dedicated support',
          'Custom branding',
        ]),
        is_active: true,
      },
    ];

    for (const plan of plans) {
      try {
        // Check if plan already exists
        const existing = await this.subscriptionModel.findOne({
          where: { subType: plan.subType },
        });

        if (existing) {
          // Update existing plan
          await existing.update(plan);
          this.logger.log(`Updated ${plan.subType} subscription plan`);
        } else {
          // Create new plan
          await this.subscriptionModel.create(plan);
          this.logger.log(`Created ${plan.subType} subscription plan`);
        }
      } catch (error) {
        this.logger.error(`Error seeding ${plan.subType}:`, error);
      }
    }

    this.logger.log('Subscription seeding completed!');
    return { success: true, message: 'Subscription plans seeded successfully' };
  }

  async listPlans() {
    return await this.subscriptionModel.findAll();
  }

  async clearPlans() {
    await this.subscriptionModel.destroy({ where: {} });
    this.logger.warn('All subscription plans deleted!');
    return { success: true, message: 'All plans deleted' };
  }
}
