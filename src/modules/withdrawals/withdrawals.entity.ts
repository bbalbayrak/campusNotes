import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.entity';
import { WithdrawalStatus } from './withdrawals.status';

@Table
export class Withdrawal extends Model<Withdrawal> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: number;

  @Column({
    type: DataType.ENUM(...Object.values(WithdrawalStatus)),
    allowNull: false,
    defaultValue: WithdrawalStatus.PENDING,
  })
  status: WithdrawalStatus;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  payment_method: string; // 'BANK_TRANSFER', 'PAYPAL', etc.

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  payment_details: string; // JSON with IBAN, etc.

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  transaction_reference: string; // Bank reference number

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  processed_at: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  rejection_reason: string;
}
