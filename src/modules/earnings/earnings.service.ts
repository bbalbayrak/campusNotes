import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EARNINGS_REPOSITORY } from 'src/config/constants';
import { Earnings } from './earnings.entity';
import { UsersService } from '../users/users.service';
import { Op } from 'sequelize';
import { User } from '../users/users.entity';

@Injectable()
export class EarningsService {
  constructor(
    @Inject(EARNINGS_REPOSITORY)
    private readonly earningsRepository: typeof Earnings,
    private readonly userService: UsersService,
  ) {}

  async updateAuthorEarnings(authorId: number) {
    const pendingEarnings = await this.earningsRepository.findAll({
      where: {
        user_id: authorId,
        status: 'PENDING',
      },
    });

    let totalPending = 0;

    for (const earning of pendingEarnings) {
      totalPending += Number(earning.gross_amount);
    }

    const finalizedTotal = Number(totalPending.toFixed(2));

    const uploaderUserEarnings =
      await this.userService.updateUserPendingEarnings(
        authorId,
        finalizedTotal,
      );

    return uploaderUserEarnings;
  }

  async getPlatformDebtList() {
    const debtList = await this.earningsRepository.findAll({
      attributes: [
        'user_id',
        // 'id' yerine açıkça 'Earnings.id' veya sadece 'user_id' kullanmalısın
        [
          this.earningsRepository.sequelize.fn(
            'SUM',
            this.earningsRepository.sequelize.col('Earnings.uploader_amount'),
          ),
          'total_debt',
        ],
        [
          this.earningsRepository.sequelize.fn(
            'COUNT',
            this.earningsRepository.sequelize.col('Earnings.id'),
          ),
          'total_sales_count',
        ],
      ],
      where: {
        status: { [Op.in]: ['PENDING', 'CONFIRMED'] },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'pending_earnings'],
        },
      ],
      group: ['Earnings.user_id', 'user.id'],
      order: [
        [this.earningsRepository.sequelize.literal('total_debt'), 'DESC'],
      ],
    });

    return debtList.map((item: any) => ({
      userId: item.user_id,
      userName: `${item.user?.name} `,
      email: item.user?.email,
      totalDebt: Number(Number(item.get('total_debt')).toFixed(2)),
      pendingOnUserTable: item.user?.pending_earnings,
      salesCount: item.get('total_sales_count'),
    }));
  }

  async processUserPayout(authorId: number) {
    const transaction = await this.earningsRepository.sequelize.transaction();

    try {
      const pendingEarnings = await this.earningsRepository.findAll({
        where: {
          user_id: authorId,
          status: { [Op.in]: ['PENDING', 'CONFIRMED'] },
        },
        transaction,
      });

      if (pendingEarnings.length === 0) {
        throw new BadRequestException(
          'No pending earnings to process for this user.',
        );
      }

      const totalPaid = pendingEarnings.reduce(
        (sum, e) => sum + Number(e.uploader_amount),
        0,
      );

      await this.earningsRepository.update(
        {
          status: 'WITHDRAWN',
          withdrawn_at: new Date(),
        },
        {
          where: {
            user_id: authorId,
            status: { [Op.in]: ['PENDING', 'CONFIRMED'] },
          },
          transaction,
        },
      );

      const user = await User.findByPk(authorId, { transaction });
      if (user) {
        user.pending_earnings = 0;
        await user.save({ transaction });
      }

      await transaction.commit();

      return {
        message: 'Payout processed successfully.',
        paidAmount: Number(totalPaid.toFixed(2)),
        authorId,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
