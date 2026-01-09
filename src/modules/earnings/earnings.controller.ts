import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { EarningsService } from './earnings.service';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';
import { RolesGuard } from 'src/decorators/roles.guard';
import { Roles } from 'src/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('earnings')
export class EarningsController {
  constructor(private readonly earningsService: EarningsService) {}

  @Get('platform-debt')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  async getPlatformDebtList() {
    const debtList = await this.earningsService.getPlatformDebtList();
    return {
      message: 'Platform debt list retrieved successfully',
      data: debtList,
    };
  }
}
