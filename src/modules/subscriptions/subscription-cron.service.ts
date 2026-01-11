import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class SubscriptionCronService {
  private readonly logger = new Logger(SubscriptionCronService.name);

  constructor(private readonly subscriptionService: SubscriptionsService) {}

  /**
   * Run every day at 2:00 AM
   * Check and expire subscriptions
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleExpiredSubscriptions() {
    this.logger.log('Starting expired subscriptions check...');

    try {
      const result = await this.subscriptionService.checkExpiredSubscriptions();
      this.logger.log(`Completed: ${result.message}`);
    } catch (error) {
      this.logger.error('Error checking expired subscriptions:', error);
    }
  }

  /**
   * Run every Sunday at 3:00 AM
   * Verify active subscriptions with Apple/Google
   */
  @Cron(CronExpression.EVERY_WEEK)
  async verifyActiveSubscriptions() {
    this.logger.log('Starting active subscriptions verification...');

    try {
      const result = await this.subscriptionService.verifyActiveSubscriptions();
      this.logger.log(`Completed: ${result.message}`);
    } catch (error) {
      this.logger.error('Error verifying subscriptions:', error);
    }
  }

  /**
   * Run every hour
   * Check for subscriptions expiring in 24 hours (send reminder emails)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendExpirationReminders() {
    this.logger.log('Checking for expiring subscriptions...');

    try {
      // You can implement this in SubscriptionService
      // await this.subscriptionService.sendExpirationReminders();
    } catch (error) {
      this.logger.error('Error sending expiration reminders:', error);
    }
  }

  /**
   * Run every 10 minutes
   * Process pending earnings (move from pending to available)
   */
  @Cron('*/10 * * * *') // Every 10 minutes
  async processEarnings() {
    this.logger.log('Processing earnings...');

    try {
      // You'll implement this in EarningsService
      // await this.earningsService.processAvailableEarnings();
    } catch (error) {
      this.logger.error('Error processing earnings:', error);
    }
  }

  async triggerManualCheck() {
    this.logger.log('Manual trigger: checking expired subscriptions');
    return await this.subscriptionService.checkExpiredSubscriptions();
  }
}
