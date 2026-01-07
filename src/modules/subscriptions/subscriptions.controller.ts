import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';
import { CreateSubscriptionDto } from './dto/subs.dto';

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getSubscriptions(@Res() res: Response) {
    const subs = await this.subscriptionsService.getAllActive();
    return res.json({
      message: 'Subscriptions fetched successfully',
      data: subs,
    });
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createSubscriptions(
    @Res() res: Response,
    @Body() body: CreateSubscriptionDto,
  ) {
    const sub = await this.subscriptionsService.createSubscription(body);
    return res.json({
      message: 'Subscription created successfully',
      data: sub,
    });
  }
}
