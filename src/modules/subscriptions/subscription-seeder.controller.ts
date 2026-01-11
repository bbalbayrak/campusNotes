import {
  Controller,
  Post,
  Get,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionSeederService } from './subscription-seeder.service';

@Controller('admin/seed')
export class SubscriptionSeederController {
  constructor(private readonly seederService: SubscriptionSeederService) {}

  @Post('subscriptions')
  @HttpCode(HttpStatus.OK)
  async seedSubscriptions() {
    return await this.seederService.seedSubscriptions();
  }

  @Get('subscriptions')
  async listPlans() {
    return await this.seederService.listPlans();
  }

  @Delete('subscriptions')
  @HttpCode(HttpStatus.OK)
  async clearPlans() {
    return await this.seederService.clearPlans();
  }
}
