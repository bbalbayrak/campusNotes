import {
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
}
