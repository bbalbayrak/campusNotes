import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.entity';
import { Subscriptions } from '../subscriptions/subscriptions.entity';
import { SubscriptionStatus } from './userSub.status';

@Table
export class UserSubscription extends Model<UserSubscription> {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  user_id: number;

  @ForeignKey(() => Subscriptions)
  @Column({ type: DataType.INTEGER })
  subscription_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(SubscriptionStatus)),
    allowNull: false,
    defaultValue: SubscriptionStatus.ACTIVE,
  })
  status: string;

  @Column({ type: DataType.DATE })
  starts_at: Date;

  @Column({ type: DataType.DATE })
  expires_at: Date;

  @Column({
    type: DataType.ENUM('IAP', 'ADMIN', 'PROMO'),
    allowNull: false,
  })
  source: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  iap_transaction_id: string; // Apple/Google transaction ID

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  original_transaction_id: string; // For renewal tracking

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  receipt_data: string; // Store receipt for verification

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  auto_renew: boolean; // Is auto-renewal enabled?

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  cancelled_at: Date; // When user cancelled

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  cancellation_reason: string;

  @BelongsTo(() => Subscriptions)
  subscription: Subscriptions;
}
