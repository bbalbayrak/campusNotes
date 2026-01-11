import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { UserPlanType } from '../users/userTypes';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';
import { SubscriptionsService } from './subscriptions.service';
import { Request, Response } from 'express';
import { Roles } from 'src/decorators/roles.decorators';
import { RolesGuard } from 'src/decorators/roles.guard';

import { ActivateSubscriptionDto } from './dto/subs.dto';
import { CancelSubscriptionDto } from './dto/subs.dto';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionService: SubscriptionsService) {}

  @Get('plans')
  async getSubscriptionPlans() {
    return await this.subscriptionService.getAllPlans();
  }

  /**
   * POST /subscriptions/activate
   * User purchased subscription via IAP, now activate it
   */
  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activateSubscription(
    @Req() req: Request,
    @Body() dto: ActivateSubscriptionDto,
    @Res() res: Response,
  ) {
    const userId = req['user'].userId;

    const receipt = {
      platform: dto.platform,
      receiptData: dto.receiptData,
      productId: dto.productId,
      transactionId: dto.transactionId,
    };

    const result = await this.subscriptionService.activateSubscription(
      userId,
      dto.subscriptionType,
      receipt,
    );

    return res.json({
      message: 'Subscription activated successfully',
      data: result,
    });
  }

  @Get('my-subscription')
  async getMySubscription(@Req() req: Request, @Res() res: Response) {
    const userId = req['user'].userId;
    const subscription =
      await this.subscriptionService.getUserSubscription(userId);
    return res.json({
      message: 'Current subscription fetched successfully',
      data: subscription,
    });
  }

  @Get('status')
  async getSubscriptionStatus(@Req() req: Request, @Res() res: Response) {
    const userId = req['user'].userId;
    const isActive =
      await this.subscriptionService.hasActiveSubscription(userId);

    return res.json({
      message: 'Subscription status fetched successfully',
      isActive: isActive,
    });
  }

  @Get('history')
  async getSubscriptionHistory(@Req() req: Request, @Res() res: Response) {
    const userId = req['user'].userId;
    const history =
      await this.subscriptionService.getSubscriptionHistory(userId);
    return res.json({
      message: 'Subscription history fetched successfully',
      data: history,
    });
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(
    @Req() req: Request,
    @Body() dto: CancelSubscriptionDto,
    @Res() res: Response,
  ) {
    const userId = req['user'].userId;
    const result = await this.subscriptionService.cancelSubscription(
      userId,
      dto.reason,
    );
    return res.json({
      message: 'Subscription cancelled successfully',
      data: result,
    });
  }

  @Post('verify-receipt')
  @HttpCode(HttpStatus.OK)
  async verifyReceipt(
    @Req() req: Request,
    @Body()
    dto: {
      platform: 'apple' | 'google';
      receiptData: string;
      productId: string;
    },
    @Res() res: Response,
  ) {
    const userId = req['user'].userId;

    try {
      const verified = await this.subscriptionService.verifyIAPReceipt({
        platform: dto.platform,
        receiptData: dto.receiptData,
        productId: dto.productId,
      });

      if (verified.isValid) {
        // Check if subscription exists, if not create it
        const existing =
          await this.subscriptionService.getUserSubscription(userId);

        if (!existing || existing.status !== 'ACTIVE') {
          // Restore subscription
          return await this.subscriptionService.restoreSubscription(
            userId,
            verified,
            dto.platform,
          );
        }

        return res.json({
          message: 'Receipt is valid and subscription is active',
          success: true,
          subscription: existing,
        });
      }

      return res.json({
        success: false,
        message: 'Invalid receipt',
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  }

  @Get(':id/benefits')
  async getSubscriptionBenefits(@Param('id') id: number) {
    return await this.subscriptionService.getSubscriptionBenefits(id);
  }

  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Get('all')
  async getAllSubscriptions(@Res() res: Response) {
    const allSubs = await this.subscriptionService.getAllPlans();
    return res.json({
      message: 'All subscription plans fetched successfully',
      data: allSubs,
    });
  }

  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Post(':userId/grant')
  async grantSubscription(
    @Param('userId') userId: number,
    @Body() dto: { subscriptionType: UserPlanType; duration_days: number },
  ) {
    return await this.subscriptionService.grantSubscriptionByAdmin(
      userId,
      dto.subscriptionType,
      dto.duration_days,
    );
  }
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Post(':userId/revoke')
  async revokeSubscription(@Param('userId') userId: number) {
    return await this.subscriptionService.revokeSubscriptionByAdmin(userId);
  }
}
