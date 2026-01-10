import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EarningsService } from './earnings.service';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';
import { RolesGuard } from 'src/decorators/roles.guard';
import { Roles } from 'src/decorators/roles.decorators';
import { Response } from 'express';

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

  @Patch('payout/:authorId')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  async processAuthorPayout(
    @Param('authorId') authorId: number,
    @Res() res: Response,
  ) {
    const payoutResult = await this.earningsService.processUserPayout(authorId);
    return res.json({
      message: 'Author payout processed successfully',
      data: payoutResult,
    });
  }

  @Patch('payout/specific/:authorId/:earningId')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  async processSpecificEarningsPayout(
    @Param('authorId') authorId: number,
    @Param('earningId') earningId: number,
    @Res() res: Response,
  ) {
    const payoutResult = await this.earningsService.processSingleEarningPayout(
      authorId,
      earningId,
    );
    return res.json({
      message: 'Specific earnings payout processed successfully',
      data: payoutResult,
    });
  }
}
