import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AppleJwtVerifierService } from './apple-jwt-verifier.service';

@Controller('webhooks')
export class SubscriptionWebhookController {
  private readonly logger = new Logger(SubscriptionWebhookController.name);

  constructor(
    private readonly subscriptionService: SubscriptionsService,
    private readonly appleJwtVerifier: AppleJwtVerifierService,
  ) {}

  /**
   * Apple sends webhook notifications for subscription events
   * Documentation: https://developer.apple.com/documentation/appstoreservernotifications
   */
  @Post('apple')
  @HttpCode(HttpStatus.OK)
  async handleAppleWebhook(
    @Body() notification: any,
    @Headers('x-apple-notification-type') notificationType: string,
  ) {
    this.logger.log(`Received Apple webhook: ${notificationType}`);

    try {
      // Apple sends different notification types
      const { notification_type, data } = notification;
      const signedPayload = data?.signedPayload;

      if (!signedPayload) {
        this.logger.warn('No signed payload in Apple notification');
        return { status: 'ignored' };
      }

      // Decode and verify the signed payload (JWT)
      const decoded = await this.verifyAppleJWT(signedPayload);
      const transactionInfo = decoded.data?.signedTransactionInfo;

      if (!transactionInfo) {
        return { status: 'ignored' };
      }

      // Handle different notification types
      switch (notification_type) {
        case 'DID_RENEW':
          // Subscription renewed successfully
          await this.handleAppleRenewal(transactionInfo);
          break;

        case 'DID_FAIL_TO_RENEW':
          // Renewal failed (payment issue)
          await this.handleAppleRenewalFailure(transactionInfo);
          break;

        case 'DID_CHANGE_RENEWAL_STATUS':
          // User turned auto-renewal on/off
          await this.handleAppleRenewalStatusChange(transactionInfo);
          break;

        case 'EXPIRED':
          // Subscription expired
          await this.handleAppleExpiration(transactionInfo);
          break;

        case 'REFUND':
          // User got refunded
          await this.handleAppleRefund(transactionInfo);
          break;

        default:
          this.logger.log(
            `Unhandled Apple notification type: ${notification_type}`,
          );
      }

      return { status: 'success' };
    } catch (error) {
      this.logger.error('Error processing Apple webhook:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Google sends Pub/Sub notifications for subscription events
   * Documentation: https://developer.android.com/google/play/billing/rtdn-reference
   */
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async handleGoogleWebhook(@Body() pubsubMessage: any) {
    this.logger.log('Received Google webhook');

    try {
      // Google sends data as base64 encoded in Pub/Sub message
      if (!pubsubMessage.message?.data) {
        return { status: 'ignored' };
      }

      // Decode the message
      const decodedData = Buffer.from(
        pubsubMessage.message.data,
        'base64',
      ).toString('utf-8');

      const notification = JSON.parse(decodedData);

      // Extract subscription notification
      const subscriptionNotification = notification.subscriptionNotification;

      if (!subscriptionNotification) {
        return { status: 'ignored' };
      }

      const { notificationType, subscriptionId, purchaseToken } =
        subscriptionNotification;

      // Handle different notification types
      switch (notificationType) {
        case 1: // SUBSCRIPTION_RECOVERED
          await this.handleGoogleRecovered(subscriptionId, purchaseToken);
          break;

        case 2: // SUBSCRIPTION_RENEWED
          await this.handleGoogleRenewal(subscriptionId, purchaseToken);
          break;

        case 3: // SUBSCRIPTION_CANCELED
          await this.handleGoogleCancellation(subscriptionId, purchaseToken);
          break;

        case 4: // SUBSCRIPTION_PURCHASED
          // Usually handled in app, but good to log
          this.logger.log('New subscription purchased via Google');
          break;

        case 5: // SUBSCRIPTION_ON_HOLD
          await this.handleGoogleOnHold(subscriptionId, purchaseToken);
          break;

        case 6: // SUBSCRIPTION_IN_GRACE_PERIOD
          await this.handleGoogleGracePeriod(subscriptionId, purchaseToken);
          break;

        case 7: // SUBSCRIPTION_RESTARTED
          await this.handleGoogleRestarted(subscriptionId, purchaseToken);
          break;

        case 8: // SUBSCRIPTION_PRICE_CHANGE_CONFIRMED
          this.logger.log('User confirmed price change');
          break;

        case 9: // SUBSCRIPTION_DEFERRED
          this.logger.log('Subscription payment deferred');
          break;

        case 10: // SUBSCRIPTION_PAUSED
          await this.handleGooglePaused(subscriptionId, purchaseToken);
          break;

        case 11: // SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED
          this.logger.log('Pause schedule changed');
          break;

        case 12: // SUBSCRIPTION_REVOKED
          await this.handleGoogleRevoked(subscriptionId, purchaseToken);
          break;

        case 13: // SUBSCRIPTION_EXPIRED
          await this.handleGoogleExpired(subscriptionId, purchaseToken);
          break;

        default:
          this.logger.log(
            `Unhandled Google notification type: ${notificationType}`,
          );
      }

      return { status: 'success' };
    } catch (error) {
      this.logger.error('Error processing Google webhook:', error);
      return { status: 'error', message: error.message };
    }
  }

  private async handleAppleRenewal(transactionInfo: any) {
    this.logger.log('Processing Apple renewal');

    const originalTransactionId = transactionInfo.originalTransactionId;
    const newTransactionId = transactionInfo.transactionId;
    const expiresDate = new Date(parseInt(transactionInfo.expiresDate));

    await this.subscriptionService.processRenewal({
      originalTransactionId,
      newTransactionId,
      expiresDate,
      platform: 'apple',
    });
  }

  private async handleAppleRenewalFailure(transactionInfo: any) {
    this.logger.warn('Apple renewal failed');

    // Mark subscription as payment failed
    await this.subscriptionService.markPaymentFailed(
      transactionInfo.originalTransactionId,
      'apple',
    );
  }

  private async handleAppleRenewalStatusChange(transactionInfo: any) {
    const autoRenewStatus = transactionInfo.autoRenewStatus;

    await this.subscriptionService.updateAutoRenewStatus(
      transactionInfo.originalTransactionId,
      autoRenewStatus === '1', // '1' = enabled, '0' = disabled
    );
  }

  private async handleAppleExpiration(transactionInfo: any) {
    this.logger.log('Apple subscription expired');

    await this.subscriptionService.expireSubscription(
      transactionInfo.originalTransactionId,
      'apple',
    );
  }

  private async handleAppleRefund(transactionInfo: any) {
    this.logger.warn('Apple subscription refunded');

    await this.subscriptionService.processRefund(
      transactionInfo.transactionId,
      'apple',
    );
  }
  private async verifyAppleJWT(signedPayload: string): Promise<any> {
    return await this.appleJwtVerifier.verifyAppleJWT(signedPayload);
  }

  private async handleGoogleRenewal(
    subscriptionId: string,
    purchaseToken: string,
  ) {
    this.logger.log('Processing Google renewal');

    await this.subscriptionService.processGoogleRenewal(
      subscriptionId,
      purchaseToken,
    );
  }

  private async handleGoogleCancellation(
    subscriptionId: string,
    purchaseToken: string,
  ) {
    this.logger.log('Google subscription cancelled');

    await this.subscriptionService.cancelSubscriptionByToken(
      purchaseToken,
      'User cancelled',
    );
  }

  private async handleGoogleRecovered(
    subscriptionId: string,
    purchaseToken: string,
  ) {
    this.logger.log('Google subscription recovered from payment failure');

    // Reactivate subscription
    await this.subscriptionService.reactivateSubscription(purchaseToken);
  }

  private async handleGoogleOnHold(
    subscriptionId: string,
    purchaseToken: string,
  ) {
    this.logger.warn('Google subscription on hold (payment issue)');

    await this.subscriptionService.markPaymentFailed(purchaseToken, 'google');
  }

  private async handleGoogleGracePeriod(
    subscriptionId: string,
    purchaseToken: string,
  ) {
    this.logger.log('Google subscription in grace period');

    // User has time to fix payment - don't cancel yet
    await this.subscriptionService.markGracePeriod(purchaseToken);
  }

  private async handleGoogleRestarted(
    subscriptionId: string,
    purchaseToken: string,
  ) {
    this.logger.log('Google subscription restarted');

    await this.subscriptionService.reactivateSubscription(purchaseToken);
  }

  private async handleGooglePaused(
    subscriptionId: string,
    purchaseToken: string,
  ) {
    this.logger.log('Google subscription paused');

    await this.subscriptionService.pauseSubscription(purchaseToken);
  }

  private async handleGoogleRevoked(
    subscriptionId: string,
    purchaseToken: string,
  ) {
    this.logger.warn('Google subscription revoked (refunded)');

    await this.subscriptionService.processRefund(purchaseToken, 'google');
  }

  private async handleGoogleExpired(
    subscriptionId: string,
    purchaseToken: string,
  ) {
    this.logger.log('Google subscription expired');

    await this.subscriptionService.expireSubscription(purchaseToken, 'google');
  }
}
