import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Op } from 'sequelize';
import { firstValueFrom } from 'rxjs';
import { User } from '../users/users.entity';
import { UserPlanType } from '../users/userTypes';
import { SubscriptionStatus } from '../user_subscriptions/userSub.status';
import {
  SUBSCRIPTION_REPOSITORY,
  USER_REPOSITORY,
  USER_SUBSCRIPTION_REPOSITORY,
} from 'src/config/constants';
import { Subscriptions } from './subscriptions.entity';
import { UserSubscription } from '../user_subscriptions/user_subscriptions.entity';

interface IAPReceipt {
  platform: 'apple' | 'google';
  receiptData: string;
  productId: string;
  transactionId?: string;
}

interface VerifiedReceipt {
  isValid: boolean;
  transactionId: string;
  originalTransactionId: string;
  productId: string;
  expiresDate?: Date;
  purchaseDate: Date;
}

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(USER_REPOSITORY)
    private readonly userModel: typeof User,

    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionModel: typeof Subscriptions,

    @Inject(USER_SUBSCRIPTION_REPOSITORY)
    private readonly userSubscriptionModel: typeof UserSubscription,
  ) {}

  async verifyIAPReceipt(receipt: IAPReceipt): Promise<VerifiedReceipt> {
    if (receipt.platform === 'apple') {
      return await this.verifyAppleReceipt(receipt);
    } else if (receipt.platform === 'google') {
      return await this.verifyGoogleReceipt(receipt);
    }
    throw new BadRequestException('Invalid platform');
  }

  private async verifyAppleReceipt(
    receipt: IAPReceipt,
  ): Promise<VerifiedReceipt> {
    const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';
    const APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';

    const requestBody = {
      'receipt-data': receipt.receiptData,
      password: process.env.APPLE_SHARED_SECRET,
      'exclude-old-transactions': true,
    };

    try {
      // Try production first
      let response = await firstValueFrom(
        this.httpService.post(APPLE_PRODUCTION_URL, requestBody),
      );

      // If sandbox receipt, try sandbox URL
      if (response.data.status === 21007) {
        response = await firstValueFrom(
          this.httpService.post(APPLE_SANDBOX_URL, requestBody),
        );
      }

      const {
        status,
        receipt: appleReceipt,
        latest_receipt_info,
      } = response.data;

      // Status 0 means valid
      if (status !== 0) {
        throw new BadRequestException(
          `Apple receipt validation failed: ${status}`,
        );
      }

      // Get the latest transaction info
      const latestTransaction =
        latest_receipt_info?.[0] || appleReceipt.in_app?.[0];

      if (!latestTransaction) {
        throw new BadRequestException('No transaction found in receipt');
      }

      return {
        isValid: true,
        transactionId: latestTransaction.transaction_id,
        originalTransactionId: latestTransaction.original_transaction_id,
        productId: latestTransaction.product_id,
        expiresDate: latestTransaction.expires_date_ms
          ? new Date(parseInt(latestTransaction.expires_date_ms))
          : undefined,
        purchaseDate: new Date(parseInt(latestTransaction.purchase_date_ms)),
      };
    } catch (error) {
      console.error('Apple receipt verification error:', error);
      throw new BadRequestException('Failed to verify Apple receipt');
    }
  }

  private async verifyGoogleReceipt(
    receipt: IAPReceipt,
  ): Promise<VerifiedReceipt> {
    const PACKAGE_NAME = process.env.GOOGLE_PACKAGE_NAME;
    const { GoogleAuth } = require('google-auth-library');

    try {
      const auth = new GoogleAuth({
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/androidpublisher'],
      });

      const client = await auth.getClient();
      const androidpublisher =
        require('@googleapis/androidpublisher').androidpublisher({
          version: 'v3',
          auth: client,
        });

      // Verify subscription purchase
      const response = await androidpublisher.purchases.subscriptions.get({
        packageName: PACKAGE_NAME,
        subscriptionId: receipt.productId,
        token: receipt.receiptData, // Purchase token
      });

      const purchase = response.data;

      // Check if subscription is valid
      if (!purchase || purchase.paymentState !== 1) {
        throw new BadRequestException('Invalid Google purchase');
      }

      return {
        isValid: true,
        transactionId: purchase.orderId,
        originalTransactionId: purchase.orderId,
        productId: receipt.productId,
        expiresDate: purchase.expiryTimeMillis
          ? new Date(parseInt(purchase.expiryTimeMillis))
          : undefined,
        purchaseDate: new Date(parseInt(purchase.startTimeMillis)),
      };
    } catch (error) {
      console.error('Google receipt verification error:', error);
      throw new BadRequestException('Failed to verify Google receipt');
    }
  }

  async activateSubscription(
    userId: number,
    subscriptionType: UserPlanType,
    iapReceipt: IAPReceipt,
  ) {
    // // 1. Verify IAP receipt with Apple/Google
    // const verified = await this.verifyIAPReceipt(iapReceipt);

    // if (!verified.isValid) {
    //   throw new BadRequestException('Invalid receipt');
    // }
    const verified = {
      isValid: true,
      transactionId: iapReceipt.transactionId || 'test-' + Date.now(),
      originalTransactionId: 'original-' + Date.now(),
      productId: iapReceipt.productId,
      purchaseDate: new Date(),
      expiresDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    };

    // 2. Check if transaction already processed (prevent duplicates)
    const existingSubscription = await this.userSubscriptionModel.findOne({
      where: { iap_transaction_id: verified.transactionId },
    });

    if (existingSubscription) {
      throw new BadRequestException('Transaction already processed');
    }

    // 3. Get subscription details
    const subscription = await this.subscriptionModel.findOne({
      where: { subType: subscriptionType },
    });

    if (!subscription) {
      throw new BadRequestException('Subscription plan not found');
    }

    // 4. Calculate expiry date
    const expiresAt = verified.expiresDate || new Date();
    if (!verified.expiresDate) {
      expiresAt.setDate(expiresAt.getDate() + subscription.duration_days);
    }

    // 5. Deactivate any existing active subscriptions
    await this.userSubscriptionModel.update(
      {
        status: SubscriptionStatus.EXPIRED,
        cancelled_at: new Date(),
      },
      {
        where: {
          user_id: userId,
          status: SubscriptionStatus.ACTIVE,
        },
      },
    );

    // 6. Create new user subscription
    const userSub = await this.userSubscriptionModel.create({
      user_id: userId,
      subscription_id: subscription.id,
      status: SubscriptionStatus.ACTIVE,
      starts_at: new Date(),
      expires_at: expiresAt,
      source: 'IAP',
      iap_transaction_id: verified.transactionId,
      original_transaction_id: verified.originalTransactionId,
      receipt_data: JSON.stringify(iapReceipt),
      auto_renew: true,
    });

    // 7. Update user's plan
    await this.userModel.update(
      {
        plan_type: subscriptionType,
        plan_expires_at: expiresAt,
      },
      { where: { id: userId } },
    );

    return {
      success: true,
      subscription: userSub,
      expiresAt,
    };
  }

  // SUBSCRIPTION RENEWAL (Auto-renew via webhook)
  async renewSubscription(
    originalTransactionId: string,
    newReceipt: IAPReceipt,
  ) {
    // 1. Find existing subscription by original transaction ID
    const userSub = await this.userSubscriptionModel.findOne({
      where: { original_transaction_id: originalTransactionId },
      order: [['created_at', 'DESC']],
    });

    if (!userSub) {
      throw new BadRequestException('Subscription not found');
    }

    // 2. Verify new receipt
    const verified = await this.verifyIAPReceipt(newReceipt);

    if (!verified.isValid) {
      throw new BadRequestException('Invalid renewal receipt');
    }

    // 3. Get subscription details
    const subscription = await this.subscriptionModel.findByPk(
      userSub.subscription_id,
    );

    // 4. Calculate new expiry date
    const newExpiresAt = verified.expiresDate || new Date();
    if (!verified.expiresDate) {
      newExpiresAt.setDate(newExpiresAt.getDate() + subscription.duration_days);
    }

    // 5. Update existing subscription or create new one
    if (userSub.status === SubscriptionStatus.ACTIVE) {
      // Extend current subscription
      await userSub.update({
        expires_at: newExpiresAt,
        iap_transaction_id: verified.transactionId,
      });
    } else {
      // Reactivate subscription
      await userSub.update({
        status: SubscriptionStatus.ACTIVE,
        expires_at: newExpiresAt,
        iap_transaction_id: verified.transactionId,
        cancelled_at: null,
      });
    }

    // 6. Update user's plan
    const user = await this.userModel.findByPk(userSub.user_id);
    await user.update({
      plan_expires_at: newExpiresAt,
    });

    return userSub;
  }

  // SUBSCRIPTION CANCELLATION
  async cancelSubscription(userId: number, reason?: string) {
    const userSub = await this.userSubscriptionModel.findOne({
      where: {
        user_id: userId,
        status: SubscriptionStatus.ACTIVE,
      },
      order: [['createdAt', 'DESC']],
    });

    if (!userSub) {
      throw new BadRequestException('No active subscription found');
    }

    // Mark as cancelled but keep active until expiry
    await userSub.update({
      auto_renew: false,
      cancelled_at: new Date(),
      cancellation_reason: reason || 'User cancelled',
    });

    return {
      success: true,
      message:
        'Subscription will be cancelled at the end of the current period',
      expiresAt: userSub.expires_at,
    };
  }

  // CRON JOBS
  async checkExpiredSubscriptions() {
    const expired = await this.userSubscriptionModel.findAll({
      where: {
        status: SubscriptionStatus.ACTIVE,
        expires_at: { [Op.lt]: new Date() },
        auto_renew: false,
      },
    });

    for (const sub of expired) {
      // Update subscription status
      await sub.update({ status: SubscriptionStatus.EXPIRED });

      // Downgrade user to FREE
      await this.userModel.update(
        {
          plan_type: UserPlanType.FREE,
          plan_expires_at: null,
        },
        { where: { id: sub.user_id } },
      );
    }

    return {
      expired: expired.length,
      message: `Processed ${expired.length} expired subscriptions`,
    };
  }

  /**
   * Verify active subscriptions with Apple/Google (Run weekly)
   * This helps catch cancelled subscriptions that weren't reported via webhook
   */
  async verifyActiveSubscriptions() {
    const activeSubscriptions = await this.userSubscriptionModel.findAll({
      where: {
        status: SubscriptionStatus.ACTIVE,
        source: 'IAP',
      },
    });

    let updated = 0;

    for (const sub of activeSubscriptions) {
      try {
        const receipt = JSON.parse(sub.receipt_data);
        const verified = await this.verifyIAPReceipt(receipt);

        // If verification fails or expired, update status
        if (
          !verified.isValid ||
          (verified.expiresDate && verified.expiresDate < new Date())
        ) {
          await sub.update({ status: SubscriptionStatus.EXPIRED });
          await this.userModel.update(
            { plan_type: UserPlanType.FREE, plan_expires_at: null },
            { where: { id: sub.user_id } },
          );
          updated++;
        }
      } catch (error) {
        console.error(`Failed to verify subscription ${sub.id}:`, error);
      }
    }

    return {
      verified: activeSubscriptions.length,
      updated,
      message: `Verified ${activeSubscriptions.length} subscriptions, updated ${updated}`,
    };
  }

  // HELPER METHODS
  async getUserSubscription(userId: number) {
    return await this.userSubscriptionModel.findOne({
      where: { user_id: userId },
      include: [Subscriptions],
      order: [['createdAt', 'DESC']],
    });
  }
  async getSubscriptionHistory(userId: number) {
    return await this.userSubscriptionModel.findAll({
      where: { user_id: userId },
      include: [Subscriptions],
      order: [['createdAt', 'DESC']],
    });
  }
  async hasActiveSubscription(userId: number): Promise<boolean> {
    const sub = await this.userSubscriptionModel.findOne({
      where: {
        user_id: userId,
        status: SubscriptionStatus.ACTIVE,
        expires_at: { [Op.gt]: new Date() },
      },
    });

    return !!sub;
  }

  // WEBHOOK HANDLER METHODS
  async processRenewal(data: {
    originalTransactionId: string;
    newTransactionId: string;
    expiresDate: Date;
    platform: string;
  }) {
    const userSub = await this.userSubscriptionModel.findOne({
      where: { original_transaction_id: data.originalTransactionId },
      order: [['created_at', 'DESC']],
    });

    if (!userSub) {
      throw new BadRequestException('Subscription not found');
    }

    // Update subscription with new transaction and expiry
    await userSub.update({
      iap_transaction_id: data.newTransactionId,
      expires_at: data.expiresDate,
      status: SubscriptionStatus.ACTIVE,
    });

    // Update user's plan expiry
    await this.userModel.update(
      { plan_expires_at: data.expiresDate },
      { where: { id: userSub.user_id } },
    );

    return userSub;
  }

  /**
   * Process Google renewal
   */
  async processGoogleRenewal(subscriptionId: string, purchaseToken: string) {
    // Verify with Google API to get latest info
    const receipt = {
      platform: 'google' as const,
      receiptData: purchaseToken,
      productId: subscriptionId,
    };

    const verified = await this.verifyIAPReceipt(receipt);

    const userSub = await this.userSubscriptionModel.findOne({
      where: { iap_transaction_id: purchaseToken },
      order: [['created_at', 'DESC']],
    });

    if (userSub && verified.expiresDate) {
      await userSub.update({
        expires_at: verified.expiresDate,
        status: SubscriptionStatus.ACTIVE,
      });

      await this.userModel.update(
        { plan_expires_at: verified.expiresDate },
        { where: { id: userSub.user_id } },
      );
    }
  }

  /**
   * Update auto-renew status
   */
  async updateAutoRenewStatus(
    originalTransactionId: string,
    autoRenew: boolean,
  ) {
    const userSub = await this.userSubscriptionModel.findOne({
      where: { original_transaction_id: originalTransactionId },
      order: [['created_at', 'DESC']],
    });

    if (userSub) {
      await userSub.update({
        auto_renew: autoRenew,
        cancelled_at: autoRenew ? null : new Date(),
      });
    }
  }

  /**
   * Mark subscription payment as failed
   */
  async markPaymentFailed(identifier: string, platform: string) {
    const whereClause =
      platform === 'apple'
        ? { original_transaction_id: identifier }
        : { iap_transaction_id: identifier };

    const userSub = await this.userSubscriptionModel.findOne({
      where: whereClause,
      order: [['created_at', 'DESC']],
    });

    if (userSub) {
      await userSub.update({
        status: SubscriptionStatus.PAYMENT_FAILED,
        auto_renew: false,
      });
    }
  }

  /**
   * Mark subscription in grace period
   */
  async markGracePeriod(purchaseToken: string) {
    const userSub = await this.userSubscriptionModel.findOne({
      where: { iap_transaction_id: purchaseToken },
      order: [['created_at', 'DESC']],
    });

    if (userSub) {
      await userSub.update({ status: SubscriptionStatus.GRACE_PERIOD });
    }
  }

  /**
   * Expire subscription from webhook
   */
  async expireSubscription(identifier: string, platform: string) {
    const whereClause =
      platform === 'apple'
        ? { original_transaction_id: identifier }
        : { iap_transaction_id: identifier };

    const userSub = await this.userSubscriptionModel.findOne({
      where: whereClause,
      order: [['created_at', 'DESC']],
    });

    if (userSub) {
      await userSub.update({ status: SubscriptionStatus.EXPIRED });

      await this.userModel.update(
        { plan_type: UserPlanType.FREE, plan_expires_at: null },
        { where: { id: userSub.user_id } },
      );
    }
  }

  /**
   * Process refund from webhook
   */
  async processRefund(identifier: string, platform: string) {
    const whereClause =
      platform === 'apple'
        ? { iap_transaction_id: identifier }
        : { iap_transaction_id: identifier };

    const userSub = await this.userSubscriptionModel.findOne({
      where: whereClause,
      order: [['created_at', 'DESC']],
    });

    if (userSub) {
      await userSub.update({
        status: SubscriptionStatus.REFUNDED,
        cancelled_at: new Date(),
        cancellation_reason: 'Refunded by store',
      });

      // Downgrade user immediately
      await this.userModel.update(
        { plan_type: UserPlanType.FREE, plan_expires_at: null },
        { where: { id: userSub.user_id } },
      );
    }
  }

  /**
   * Cancel subscription by purchase token
   */
  async cancelSubscriptionByToken(purchaseToken: string, reason: string) {
    const userSub = await this.userSubscriptionModel.findOne({
      where: { iap_transaction_id: purchaseToken },
      order: [['created_at', 'DESC']],
    });

    if (userSub) {
      await userSub.update({
        auto_renew: false,
        cancelled_at: new Date(),
        cancellation_reason: reason,
      });
    }
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(purchaseToken: string) {
    const userSub = await this.userSubscriptionModel.findOne({
      where: { iap_transaction_id: purchaseToken },
      order: [['created_at', 'DESC']],
    });

    if (userSub) {
      await userSub.update({
        status: SubscriptionStatus.ACTIVE,
        auto_renew: true,
        cancelled_at: null,
      });

      const subscription = await this.subscriptionModel.findByPk(
        userSub.subscription_id,
      );

      await this.userModel.update(
        {
          plan_type: subscription.subType as unknown as UserPlanType,
          plan_expires_at: userSub.expires_at,
        },
        { where: { id: userSub.user_id } },
      );
    }
  }

  /**
   * Pause subscription
   */
  async pauseSubscription(purchaseToken: string) {
    const userSub = await this.userSubscriptionModel.findOne({
      where: { iap_transaction_id: purchaseToken },
      order: [['created_at', 'DESC']],
    });

    if (userSub) {
      await userSub.update({ status: SubscriptionStatus.PAUSED });
    }
  }

  async getAllPlans() {
    const plans = await this.subscriptionModel.findAll({
      where: { is_active: true },
      order: [['price', 'ASC']],
      attributes: [
        'id',
        'subType',
        'price',
        'currency',
        'duration_days',
        'uploader_share_percent',
        'platform_cut_percent',
        'apple_product_id',
        'google_product_id',
        'features',
        'is_active',
      ],
    });

    // Parse features JSON for each plan
    return plans.map((plan) => ({
      ...plan.toJSON(),
      features: plan.features ? JSON.parse(plan.features) : null,
    }));
  }

  async restoreSubscription(
    userId: number,
    verified: VerifiedReceipt,
    platform: string,
  ) {
    // Find the subscription plan by product ID
    const productIdField =
      platform === 'apple' ? 'apple_product_id' : 'google_product_id';

    const subscription = await this.subscriptionModel.findOne({
      where: {
        [productIdField]: verified.productId,
      },
    });

    if (!subscription) {
      throw new BadRequestException(
        'Subscription plan not found for this product',
      );
    }

    // Check if user already has this subscription with same transaction
    const existingSub = await this.userSubscriptionModel.findOne({
      where: {
        user_id: userId,
        original_transaction_id: verified.originalTransactionId,
      },
    });

    if (existingSub) {
      // Update existing subscription
      const expiresAt = verified.expiresDate || new Date();
      if (!verified.expiresDate) {
        expiresAt.setDate(expiresAt.getDate() + subscription.duration_days);
      }

      await existingSub.update({
        status: SubscriptionStatus.ACTIVE,
        expires_at: expiresAt,
        iap_transaction_id: verified.transactionId,
      });

      // Update user's plan
      await this.userModel.update(
        {
          plan_type: subscription.subType as unknown as UserPlanType,
          plan_expires_at: expiresAt,
        },
        { where: { id: userId } },
      );

      return {
        success: true,
        message: 'Subscription restored successfully',
        subscription: existingSub,
      };
    }

    // Create new subscription if not exists
    return await this.activateSubscription(
      userId,
      subscription.subType as unknown as UserPlanType,
      {
        platform: platform as 'apple' | 'google',
        receiptData: verified.transactionId,
        productId: verified.productId,
        transactionId: verified.transactionId,
      },
    );
  }

  async getSubscriptionBenefits(subscriptionId: number) {
    const subscription = await this.subscriptionModel.findByPk(subscriptionId);

    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    // Parse features if they exist
    let features = null;
    if (subscription.features) {
      try {
        features = JSON.parse(subscription.features);
      } catch (e) {
        features = subscription.features;
      }
    }

    return {
      id: subscription.id,
      subType: subscription.subType,
      price: subscription.price,
      currency: subscription.currency,
      duration_days: subscription.duration_days,
      uploader_share_percent: subscription.uploader_share_percent,
      platform_cut_percent: subscription.platform_cut_percent,
      apple_product_id: subscription.apple_product_id,
      google_product_id: subscription.google_product_id,
      features: features,
      benefits: this.getDefaultBenefits(subscription.subType),
    };
  }

  /**
   * Get default benefits based on plan type
   */
  private getDefaultBenefits(planType: string) {
    const benefits = {
      FREE: [
        'Upload notes',
        'Purchase notes',
        'Basic search',
        '60% revenue share on sales',
      ],
      PRO_PASS: [
        'All FREE features',
        'Priority upload review',
        'Advanced analytics',
        '85% revenue share on sales',
        'Reduced platform fees',
        'Early access to new features',
      ],
      LEGEND: [
        'All PRO PASS features',
        'Premium badge on profile',
        'Featured listings',
        '95% revenue share on sales',
        'Minimal platform fees',
        'Dedicated support',
        'Custom branding options',
      ],
    };

    return benefits[planType] || [];
  }

  /**
   * Grant subscription by admin (promo codes, rewards, etc.)
   */
  async grantSubscriptionByAdmin(
    userId: number,
    subscriptionType: UserPlanType,
    durationDays: number,
  ) {
    // Find the subscription plan
    const subscription = await this.subscriptionModel.findOne({
      where: { subType: subscriptionType },
    });

    if (!subscription) {
      throw new BadRequestException('Subscription plan not found');
    }

    // Check if user exists
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Calculate expiry date
    const startsAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // Deactivate any existing active subscriptions
    await this.userSubscriptionModel.update(
      {
        status: SubscriptionStatus.EXPIRED,
        cancelled_at: new Date(),
        cancellation_reason: 'Replaced by admin grant',
      },
      {
        where: {
          user_id: userId,
          status: SubscriptionStatus.ACTIVE,
        },
      },
    );

    // Create new subscription granted by admin
    const userSub = await this.userSubscriptionModel.create({
      user_id: userId,
      subscription_id: subscription.id,
      status: SubscriptionStatus.ACTIVE,
      starts_at: startsAt,
      expires_at: expiresAt,
      source: 'ADMIN',
      auto_renew: false, // Admin grants don't auto-renew
      iap_transaction_id: null,
      original_transaction_id: null,
      receipt_data: null,
    });

    // Update user's plan
    await this.userModel.update(
      {
        plan_type: subscriptionType,
        plan_expires_at: expiresAt,
      },
      { where: { id: userId } },
    );

    return {
      success: true,
      message: `${subscriptionType} subscription granted for ${durationDays} days`,
      subscription: userSub,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan_type: subscriptionType,
        plan_expires_at: expiresAt,
      },
    };
  }

  async revokeSubscriptionByAdmin(userId: number) {
    // Find user
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Find active subscription
    const userSub = await this.userSubscriptionModel.findOne({
      where: {
        user_id: userId,
        status: SubscriptionStatus.ACTIVE,
      },
      order: [['created_at', 'DESC']],
      include: [this.subscriptionModel],
    });

    if (!userSub) {
      throw new BadRequestException(
        'No active subscription found for this user',
      );
    }

    // Update subscription status
    await userSub.update({
      status: SubscriptionStatus.CANCELLED,
      cancelled_at: new Date(),
      cancellation_reason: 'Revoked by admin',
      auto_renew: false,
    });

    // Downgrade user to FREE
    await this.userModel.update(
      {
        plan_type: UserPlanType.FREE,
        plan_expires_at: null,
      },
      { where: { id: userId } },
    );

    const subscriptionData =
      (userSub as any).Subscriptions || (userSub as any).subscription;

    return {
      success: true,
      message: 'Subscription revoked successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        previous_plan: subscriptionData?.subType,
        current_plan: UserPlanType.FREE,
      },
      revoked_subscription: {
        id: userSub.id,
        subscription_type: subscriptionData?.subType,
        was_active_until: userSub.expires_at,
        revoked_at: new Date(),
      },
    };
  }
}
