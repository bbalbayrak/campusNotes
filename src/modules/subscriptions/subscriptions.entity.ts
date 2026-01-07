import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { SubscriptionType } from './subs.type';

@Table
export class Subscriptions extends Model<Subscriptions> {
  @Column({
    type: DataType.ENUM(...Object.values(SubscriptionType)),
    allowNull: false,
    unique: true,
  })
  subType: SubscriptionType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  price: number; // 0 | 149 | 499

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  currency: string; // 'TRY'

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  duration_days: number; // 30, 365

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  uploader_share_percent: number; // 60 | 85 | 95

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  platform_cut_percent: number; // 40 | 15 | 5

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  is_active: boolean;
}
