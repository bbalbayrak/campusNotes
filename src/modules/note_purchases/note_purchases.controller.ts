import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/passport/jwt.guard';
import { NotePurchasesService } from './note_purchases.service';
import { Request, Response } from 'express';
import { RolesGuard } from 'src/decorators/roles.guard';
import { Roles } from 'src/decorators/roles.decorators';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('note-purchases')
export class NotePurchasesController {
  constructor(private readonly notePurchasesService: NotePurchasesService) {}

  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getMyPurchaseStatus(
    @Query('status') status: string,
    @Res() res: Response,
  ) {
    const statusString = String(status);

    const purchaseStatus =
      await this.notePurchasesService.filterPurchasesByStatus(statusString);
    return res.json({
      message: 'User purchase status fetched successfully',
      status: purchaseStatus,
    });
  }

  @Post('purchase/:noteId')
  @HttpCode(HttpStatus.CREATED)
  async purchaseNote(
    @Param('noteId', ParseIntPipe) noteId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = req['user'].userId;
    const newPurchase = await this.notePurchasesService.purchaseNote(
      userId,
      noteId,
    );
    return res.json({
      message: 'Note purchased successfully',
      purchase: newPurchase,
    });
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  async getAllPurchases(@Res() res: Response) {
    const purchases = await this.notePurchasesService.getAllPurchases();
    return res.json({
      message: 'All note purchases fetched successfully',
      purchases: purchases,
    });
  }

  @Get('my')
  @HttpCode(HttpStatus.OK)
  async getMyPurchases(@Req() req: Request, @Res() res: Response) {
    const userId = req['user'].userId;
    const purchases = await this.notePurchasesService.myPurchases(userId);
    return res.json({
      message: 'User purchases fetched successfully',
      purchases: purchases,
    });
  }

  @Get(':purchaseId')
  @HttpCode(HttpStatus.OK)
  async getPurchaseDetails(
    @Param('purchaseId', ParseIntPipe) purchaseId: number,
    @Res() res: Response,
  ) {
    const purchase =
      await this.notePurchasesService.getPurchaseDetails(purchaseId);
    return res.json({
      message: 'Purchase details fetched successfully',
      purchase: purchase,
    });
  }

  @Get('my/sales')
  @HttpCode(HttpStatus.OK)
  async getMySoldNotes(@Req() req: Request, @Res() res: Response) {
    const userId = req['user'].userId;
    const sales = await this.notePurchasesService.getMySoldNotes(userId);
    return res.json({
      message: 'User sold notes fetched successfully',
      sales: sales,
    });
  }

  @Roles('admin')
  @Patch('complete/:id')
  @HttpCode(HttpStatus.OK)
  async completePendingPurchases(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.notePurchasesService.completePendingPurchases(id);
    return res.json({
      message: 'Pending purchases completed successfully',
    });
  }

  @Roles('admin')
  @Patch('refund/:id')
  @HttpCode(HttpStatus.OK)
  async refundPurchase(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.notePurchasesService.refundPurchase(id);
    return res.json({
      message: 'Purchase refunded successfully',
    });
  }
}
