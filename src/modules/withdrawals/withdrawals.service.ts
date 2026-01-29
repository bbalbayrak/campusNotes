import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Withdrawal } from './withdrawals.entity';
import { WithdrawalStatus } from './withdrawals.status';
import { EarningsService } from '../earnings/earnings.service';
import { Op } from 'sequelize';
import { User } from '../users/users.entity';
import { WITHDRAWAL_REPOSITORY } from 'src/config/constants';

@Injectable()
export class WithdrawalsService {
  constructor(
    @Inject(WITHDRAWAL_REPOSITORY)
    private readonly withdrawalRepository: typeof Withdrawal,
    private readonly earningsService: EarningsService,
  ) {}

  async requestWithdrawal(
    userId: number,
    amount: number,
    paymentMethod: string,
    paymentDetails: {
      bank_name?: string;
      account_holder?: string;
      iban?: string;
      swift?: string;
      paypal_email?: string;
    },
  ) {
    const transaction = await this.withdrawalRepository.sequelize.transaction();

    try {
      // 1. Get user and check balance
      const user = await User.findByPk(userId, { transaction });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const availableBalance = Number(user.pending_earnings);

      if (availableBalance < amount) {
        throw new BadRequestException(
          `Insufficient balance. Available: ${availableBalance} TRY, Requested: ${amount} TRY`,
        );
      }

      // 2. Check minimum withdrawal amount
      const MIN_WITHDRAWAL = 50; // 50 TRY minimum
      if (amount < MIN_WITHDRAWAL) {
        throw new BadRequestException(
          `Minimum withdrawal amount is ${MIN_WITHDRAWAL} TRY`,
        );
      }

      // 3. Check for pending withdrawal requests
      const pendingWithdrawal = await this.withdrawalRepository.findOne({
        where: {
          user_id: userId,
          status: WithdrawalStatus.PENDING,
        },
        transaction,
      });

      if (pendingWithdrawal) {
        throw new BadRequestException(
          'You already have a pending withdrawal request',
        );
      }

      // 4. Create withdrawal request
      const withdrawal = await this.withdrawalRepository.create(
        {
          user_id: userId,
          amount,
          payment_method: paymentMethod,
          payment_details: JSON.stringify(paymentDetails),
          status: WithdrawalStatus.PENDING,
        },
        { transaction },
      );

      // 5. Lock the amount (deduct from pending_earnings)
      user.pending_earnings = Number((availableBalance - amount).toFixed(2));
      await user.save({ transaction });

      await transaction.commit();

      return {
        success: true,
        message: 'Withdrawal request submitted successfully',
        withdrawal: {
          id: withdrawal.id,
          amount: withdrawal.amount,
          status: withdrawal.status,
          created_at: withdrawal.createdAt,
        },
        remaining_balance: user.pending_earnings,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getUserWithdrawals(userId: number) {
    const withdrawals = await this.withdrawalRepository.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'amount',
        'status',
        'payment_method',
        'transaction_reference',
        'processed_at',
        'rejection_reason',
        'createdAt',
      ],
    });

    return withdrawals.map((w) => ({
      id: w.id,
      amount: Number(w.amount),
      status: w.status,
      payment_method: w.payment_method,
      transaction_reference: w.transaction_reference,
      processed_at: w.processed_at,
      rejection_reason: w.rejection_reason,
      requested_at: w.createdAt,
    }));
  }

  async getWithdrawalById(withdrawalId: number, userId?: number) {
    const where: any = { id: withdrawalId };
    if (userId) {
      where.user_id = userId;
    }

    const withdrawal = await this.withdrawalRepository.findOne({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!withdrawal) {
      throw new BadRequestException('Withdrawal not found');
    }

    return {
      id: withdrawal.id,
      user: withdrawal.user,
      amount: Number(withdrawal.amount),
      status: withdrawal.status,
      payment_method: withdrawal.payment_method,
      payment_details: JSON.parse(withdrawal.payment_details),
      transaction_reference: withdrawal.transaction_reference,
      processed_at: withdrawal.processed_at,
      rejection_reason: withdrawal.rejection_reason,
      requested_at: withdrawal.createdAt,
    };
  }

  //admin
  async getPendingWithdrawals() {
    const withdrawals = await this.withdrawalRepository.findAll({
      where: {
        status: WithdrawalStatus.PENDING,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'pending_earnings'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    return withdrawals.map((w) => ({
      id: w.id,
      user: {
        id: w.user.id,
        name: w.user.name,
        email: w.user.email,
        pending_earnings: w.user.pending_earnings,
      },
      amount: Number(w.amount),
      payment_method: w.payment_method,
      payment_details: JSON.parse(w.payment_details),
      requested_at: w.createdAt,
    }));
  }

  //admin
  async getAllWithdrawals(filters?: {
    status?: WithdrawalStatus;
    userId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.userId) {
      where.user_id = filters.userId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt[Op.gte] = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt[Op.lte] = filters.endDate;
      }
    }

    const withdrawals = await this.withdrawalRepository.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return withdrawals.map((w) => ({
      id: w.id,
      user: w.user,
      amount: Number(w.amount),
      status: w.status,
      payment_method: w.payment_method,
      transaction_reference: w.transaction_reference,
      processed_at: w.processed_at,
      rejection_reason: w.rejection_reason,
      requested_at: w.createdAt,
    }));
  }

  //admin
  async approveWithdrawal(withdrawalId: number, transactionReference: string) {
    const transaction = await this.withdrawalRepository.sequelize.transaction();

    try {
      // 1. Find withdrawal
      const withdrawal = await this.withdrawalRepository.findOne({
        where: {
          id: withdrawalId,
          status: WithdrawalStatus.PENDING,
        },
        transaction,
      });

      if (!withdrawal) {
        throw new BadRequestException(
          'Withdrawal not found or already processed',
        );
      }

      // 2. Mark earnings as WITHDRAWN
      await this.earningsService.processUserPayout(withdrawal.user_id);

      // 3. Update withdrawal status
      await withdrawal.update(
        {
          status: WithdrawalStatus.COMPLETED,
          transaction_reference: transactionReference,
          processed_at: new Date(),
        },
        { transaction },
      );

      await transaction.commit();

      // await this.notificationService.createNotification(
      //   withdrawal.user_id,
      //   'Withdrawal Completed!',
      //   `Your withdrawal of ${withdrawal.amount} TRY has been processed.`,
      //   'WITHDRAWAL',
      // );

      return {
        success: true,
        message: 'Withdrawal approved and processed successfully',
        withdrawal: {
          id: withdrawal.id,
          amount: Number(withdrawal.amount),
          transaction_reference: transactionReference,
          processed_at: withdrawal.processed_at,
        },
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //admin
  async rejectWithdrawal(withdrawalId: number, rejectionReason: string) {
    const transaction = await this.withdrawalRepository.sequelize.transaction();

    try {
      // 1. Find withdrawal
      const withdrawal = await this.withdrawalRepository.findOne({
        where: {
          id: withdrawalId,
          status: WithdrawalStatus.PENDING,
        },
        include: [User],
        transaction,
      });

      if (!withdrawal) {
        throw new BadRequestException(
          'Withdrawal not found or already processed',
        );
      }

      // 2. Return amount to user's pending_earnings
      const user = await User.findByPk(withdrawal.user_id, { transaction });
      if (user) {
        const currentBalance = Number(user.pending_earnings);
        const refundAmount = Number(withdrawal.amount);
        user.pending_earnings = Number(
          (currentBalance + refundAmount).toFixed(2),
        );
        await user.save({ transaction });
      }

      // 3. Update withdrawal status
      await withdrawal.update(
        {
          status: WithdrawalStatus.REJECTED,
          rejection_reason: rejectionReason,
          processed_at: new Date(),
        },
        { transaction },
      );

      await transaction.commit();

      // await this.notificationService.createNotification(
      //   withdrawal.user_id,
      //   'Withdrawal Rejected',
      //   `Your withdrawal request has been rejected. Reason: ${rejectionReason}`,
      //   'WITHDRAWAL',
      // );

      return {
        success: true,
        message: 'Withdrawal rejected and amount refunded',
        withdrawal: {
          id: withdrawal.id,
          amount: Number(withdrawal.amount),
          rejection_reason: rejectionReason,
        },
        refunded_to_user: user.pending_earnings,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async cancelWithdrawal(withdrawalId: number, userId: number) {
    const transaction = await this.withdrawalRepository.sequelize.transaction();

    try {
      // 1. Find withdrawal
      const withdrawal = await this.withdrawalRepository.findOne({
        where: {
          id: withdrawalId,
          user_id: userId,
          status: WithdrawalStatus.PENDING,
        },
        transaction,
      });

      if (!withdrawal) {
        throw new BadRequestException(
          'Withdrawal not found or cannot be cancelled',
        );
      }

      // 2. Return amount to user's pending_earnings
      const user = await User.findByPk(userId, { transaction });
      if (user) {
        const currentBalance = Number(user.pending_earnings);
        const refundAmount = Number(withdrawal.amount);
        user.pending_earnings = Number(
          (currentBalance + refundAmount).toFixed(2),
        );
        await user.save({ transaction });
      }

      // 3. Update withdrawal status
      await withdrawal.update(
        {
          status: WithdrawalStatus.CANCELLED,
          processed_at: new Date(),
        },
        { transaction },
      );

      await transaction.commit();

      return {
        success: true,
        message: 'Withdrawal cancelled successfully',
        refunded_amount: Number(withdrawal.amount),
        new_balance: user.pending_earnings,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //admin
  async getWithdrawalStats() {
    const stats = await this.withdrawalRepository.findAll({
      attributes: [
        'status',
        [
          this.withdrawalRepository.sequelize.fn(
            'COUNT',
            this.withdrawalRepository.sequelize.col('id'),
          ),
          'count',
        ],
        [
          this.withdrawalRepository.sequelize.fn(
            'SUM',
            this.withdrawalRepository.sequelize.col('amount'),
          ),
          'total_amount',
        ],
      ],
      group: ['status'],
    });

    const result: any = {
      pending: { count: 0, amount: 0 },
      completed: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      cancelled: { count: 0, amount: 0 },
      processing: { count: 0, amount: 0 },
    };

    stats.forEach((stat: any) => {
      const status = stat.status.toLowerCase();
      result[status] = {
        count: parseInt(stat.get('count')),
        amount: Number(Number(stat.get('total_amount')).toFixed(2)),
      };
    });

    return result;
  }

  async getUserWithdrawalSummary(userId: number) {
    const withdrawals = await this.withdrawalRepository.findAll({
      where: { user_id: userId },
      attributes: [
        'status',
        [
          this.withdrawalRepository.sequelize.fn(
            'COUNT',
            this.withdrawalRepository.sequelize.col('id'),
          ),
          'count',
        ],
        [
          this.withdrawalRepository.sequelize.fn(
            'SUM',
            this.withdrawalRepository.sequelize.col('amount'),
          ),
          'total_amount',
        ],
      ],
      group: ['status'],
    });

    const user = await User.findByPk(userId);

    const summary: any = {
      current_balance: user?.pending_earnings || 0,
      total_withdrawn: 0,
      pending_withdrawals: 0,
      rejected_withdrawals: 0,
    };

    withdrawals.forEach((w: any) => {
      const amount = Number(Number(w.get('total_amount')).toFixed(2));
      if (w.status === WithdrawalStatus.COMPLETED) {
        summary.total_withdrawn = amount;
      } else if (w.status === WithdrawalStatus.PENDING) {
        summary.pending_withdrawals = amount;
      } else if (w.status === WithdrawalStatus.REJECTED) {
        summary.rejected_withdrawals = amount;
      }
    });

    return summary;
  }
}
