import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NOTE_PURCHASE_REPOSITORY } from 'src/config/constants';
import { NotePurchase } from './note_purchases.entity';
import { User } from '../users/users.entity';
import { Note } from '../notes/notes.entity';
import { SubscriptionType } from '../subscriptions/subs.type';
import { Earnings } from '../earnings/earnings.entity';
import { DownloadPermission } from '../download_permissions/permission.entity';
import { DownloadPermissionSource } from '../download_permissions/permission.sources';
import { EarningsService } from '../earnings/earnings.service';
import { Op } from 'sequelize';

@Injectable()
export class NotePurchasesService {
  constructor(
    @Inject(NOTE_PURCHASE_REPOSITORY)
    private readonly notePurchaseRepository: typeof NotePurchase,
    private readonly earningsService: EarningsService,
  ) {}
  async purchaseNote(buyerId: number, noteId: number) {
    const buyer = await User.findByPk(buyerId);

    const note = await Note.findByPk(noteId);

    if (!note || !buyer) {
      throw new NotFoundException('Buyer or Note not found.');
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyFreeCount = await this.notePurchaseRepository.count({
      where: {
        buyer_id: buyerId,
        is_quota_purchase: true,
        completed_at: { [Op.gte]: startOfMonth },
      },
    });

    const splits = await this.calculateRevenueSplit(
      note.price,
      buyer.plan_type,
      monthlyFreeCount,
    );

    const existingPurchase = await this.notePurchaseRepository.findOne({
      where: { buyer_id: buyerId, note_id: noteId },
    });

    if (existingPurchase) {
      throw new ConflictException(
        'Note has already been purchased by this user.',
      );
    }

    //Create purchase record
    const purchase = await this.notePurchaseRepository.create({
      buyer_id: buyerId,
      note_id: noteId,
      price: note.price,
      platform_amount: splits.platformAmount,
      amount_paid: splits.buyerTotalPay,
      author_amount: splits.authorAmount,
      buyer_plan_type: buyer.plan_type as unknown as SubscriptionType,
      status: 'completed',
      transaction_id: `TXN-${crypto.randomUUID()}-${buyerId}-${noteId}`,
      completed_at: new Date(),
      is_quota_purchase: splits.isQuota,
    });

    //Create earning record
    await Earnings.create({
      user_id: note.author_id,
      purchase_id: purchase.id,
      note_id: noteId,
      gross_amount: splits.authorAmount,
      uploader_amount: splits.authorAmount,
      platform_amount: splits.platformAmount,
      status: 'PENDING',
      available_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      source: 'IAP',
    });

    //Create download permission
    await DownloadPermission.create({
      userId: buyerId,
      noteId: noteId,
      source: DownloadPermissionSource.PURCHASE,
    });

    //Update author's pending earnings
    await this.earningsService.updateAuthorEarnings(note.author_id);

    return purchase;
  }

  async calculateRevenueSplit(
    notePrice: number,
    buyerPlan: string,
    monthlyFreeCount: number,
  ) {
    const LEGEND_FREE_LIMIT = 10;

    let authorRate = 0.6;
    let discount = 0;
    let isQuota = false;

    if (buyerPlan === 'PRO') {
      authorRate = 0.85;
      discount = 0.1; // %10 discount
    } else if (buyerPlan === 'LEGEND') {
      authorRate = 0.95;
      if (monthlyFreeCount < LEGEND_FREE_LIMIT) {
        discount = 1.0; // Free
        isQuota = true;
      } else {
        discount = 0.35; // 35% discount after quota
      }
    }

    const buyerTotalPay = notePrice * (1 - discount);
    const authorAmount = notePrice * authorRate;
    const platformAmount = buyerTotalPay - authorAmount;

    return {
      buyerTotalPay: Number(buyerTotalPay.toFixed(2)),
      authorAmount: Number(authorAmount.toFixed(2)),
      platformAmount: Number(platformAmount.toFixed(2)),
      isQuota,
    };
  }

  //ADMIN
  async getAllPurchases() {
    const purchases = await this.notePurchaseRepository.findAll({
      include: [Note],
      order: [['completed_at', 'DESC']],
    });
    return purchases;
  }
  //ADMIN
  async getPurchaseDetails(purchaseId: number) {
    const purchase = await this.notePurchaseRepository.findOne({
      where: { id: purchaseId },
      include: [Note],
    });
    if (!purchase) {
      throw new NotFoundException('Purchase not found.');
    }

    return purchase;
  }

  //ADMIN/SYSTEM
  async completePendingPurchases(purchaseId: number): Promise<void> {
    const pendingPurchases = await this.notePurchaseRepository.findAll({
      where: { status: 'pending' },
    });
    for (const purchase of pendingPurchases) {
      purchase.status = 'completed';
      purchase.completed_at = new Date();
      await purchase.save();
    }
  }

  //ADMIN
  async refundPurchase(purchaseId: number): Promise<void> {
    const purchase = await this.notePurchaseRepository.findByPk(purchaseId);
    if (!purchase) {
      throw new NotFoundException('Purchase not found.');
    }
    purchase.status = 'refunded';
    await purchase.save();
  }

  async myPurchases(userId: number) {
    const purchases = await this.notePurchaseRepository.findAll({
      where: { buyer_id: userId },
      include: [Note],
      order: [['completed_at', 'DESC']],
    });
    if (!purchases || purchases.length === 0) {
      throw new NotFoundException('No purchases found for this user.');
    }
    return purchases;
  }
  async getMySoldNotes(userId: number) {
    const sales = await this.notePurchaseRepository.findAll({
      include: [
        {
          model: Note,
          where: { author_id: userId },
        },
      ],
      order: [['completed_at', 'DESC']],
    });
    if (!sales || sales.length === 0) {
      throw new NotFoundException('No sales found for this user.');
    }
    return sales;
  }

  async filterPurchasesByStatus(status: string): Promise<NotePurchase[]> {
    const purchases = await this.notePurchaseRepository.findAll({
      where: { status: status },
    });
    if (!purchases || purchases.length === 0) {
      throw new NotFoundException('No purchases found with this status.');
    }
    return purchases;
  }
}
