import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserSubscriptionsService } from './user_subscriptions.service';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('user-subscriptions')
export class UserSubscriptionsController {
  constructor(
    private readonly userSubscriptionsService: UserSubscriptionsService,
  ) {}

  @Get('active/:userId')
  @HttpCode(HttpStatus.OK)
  async getActiveSubscription(@Param('userId', ParseIntPipe) userId: number) {
    return this.userSubscriptionsService.getActiveSubscription(userId);
  }
}
