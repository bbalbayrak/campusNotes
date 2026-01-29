import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Patch,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';
import { RolesGuard } from 'src/decorators/roles.guard';
import { Roles } from 'src/decorators/roles.decorators';
import { Request, Response } from 'express';
import { WithdrawalStatus } from './withdrawals.status';
import { PaymentDetailsDto } from './dto/withdrawals.dto';
class RequestWithdrawalDto {
  amount: number;
  payment_method: string; // 'BANK_TRANSFER', 'PAYPAL', etc.
  payment_details: {
    bank_name?: string;
    account_holder?: string;
    iban?: string;
    swift?: string;
    paypal_email?: string;
  };
}

class ApproveWithdrawalDto {
  transaction_reference: string;
}

class RejectWithdrawalDto {
  rejection_reason: string;
}

@Controller('withdrawals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  async requestWithdrawal(
    @Req() req: Request,
    @Res() res: Response,
    @Body() dto: PaymentDetailsDto,
  ) {
    const userId = req['user'].userId;

    const paymentDetails = {
      bank_name: dto.bank_name,
      account_holder: dto.account_holder,
      iban: dto.iban,
      swift: dto.swift,
      paypal_email: dto.paypal_email,
    };

    const withdrawalRequest = await this.withdrawalsService.requestWithdrawal(
      userId,
      dto.amount,
      dto.payment_method,
      paymentDetails,
    );

    return res.json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: withdrawalRequest,
    });
  }

  @Get('my-withdrawals')
  @HttpCode(HttpStatus.OK)
  async getMyWithdrawals(@Req() req: Request, @Res() res: Response) {
    const userId = req['user'].userId;
    const myWithdrawals =
      await this.withdrawalsService.getUserWithdrawals(userId);
    return res.json({
      message: 'My withdrawals retrieved successfully',
      withdrawals: myWithdrawals,
    });
  }

  @Get('my-summary')
  @HttpCode(HttpStatus.OK)
  async getMySummary(@Req() req: Request, @Res() res: Response) {
    const userId = req['user'].userId;
    const summary =
      await this.withdrawalsService.getUserWithdrawalSummary(userId);
    return res.json({
      message: 'My withdrawal summary retrieved successfully',
      summary,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getWithdrawal(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const userId = req['user'].userId;
    const withdrawal = await this.withdrawalsService.getWithdrawalById(
      id,
      userId,
    );
    return res.json({
      message: 'Withdrawal retrieved successfully',
      withdrawal,
    });
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.CONTINUE)
  async cancelWithdrawal(
    @Req() req: Request,
    @Param('id') id: number,
    @Res() res: Response,
  ) {
    const userId = req['user'].userId;
    await this.withdrawalsService.cancelWithdrawal(id, userId);
    return res.json({
      message: 'Withdrawal cancelled successfully',
    });
  }

  @Roles('admin')
  @Get('admin/pending')
  @HttpCode(HttpStatus.OK)
  async getPendingWithdrawals(@Res() res: Response) {
    const pendingWithdrawals =
      await this.withdrawalsService.getPendingWithdrawals();
    return res.json({
      message: 'Pending withdrawals retrieved successfully',
      withdrawals: pendingWithdrawals,
    });
  }

  @Roles('admin')
  @Get('admin/all')
  @HttpCode(HttpStatus.OK)
  async getAllWithdrawals(
    @Res() res: Response,
    @Query('status') status?: WithdrawalStatus,
    @Query('userId') userId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};

    if (status) filters.status = status;
    if (userId) filters.userId = userId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    const withdrawals =
      await this.withdrawalsService.getAllWithdrawals(filters);
    return res.json({
      message: 'All withdrawals retrieved successfully',
      withdrawals,
    });
  }

  @Roles('admin')
  @Get('admin/stats')
  @HttpCode(HttpStatus.OK)
  async getStats(@Res() res: Response) {
    const stats = await this.withdrawalsService.getWithdrawalStats();
    return res.json({
      message: 'Withdrawal statistics retrieved successfully',
      stats,
    });
  }

  @Roles('admin')
  @Patch('admin/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveWithdrawal(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveWithdrawalDto,
    @Res() res: Response,
  ) {
    const withdrawal = await this.withdrawalsService.approveWithdrawal(
      id,
      dto.transaction_reference,
    );
    return res.json({
      message: 'Withdrawal approved successfully',
      withdrawal,
    });
  }

  @Roles('admin')
  @Patch('admin/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectWithdrawal(
    @Req() req: Request,
    @Param('id') id: number,
    @Body() dto: RejectWithdrawalDto,
    @Res() res: Response,
  ) {
    const withdrawal = await this.withdrawalsService.rejectWithdrawal(
      id,
      dto.rejection_reason,
    );
    return res.json({
      message: 'Withdrawal rejected successfully',
      withdrawal,
    });
  }
}
