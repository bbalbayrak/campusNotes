import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.entity';
import { Note } from '../notes/notes.entity';
import { SubscriptionType } from '../subscriptions/subs.type';

@Table
export class NotePurchase extends Model<NotePurchase> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  buyer_id: number;

  @BelongsTo(() => User)
  buyer: User;

  @ForeignKey(() => Note)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  note_id: number;

  @BelongsTo(() => Note)
  note: Note;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  price: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  })
  platform_amount: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'pending',
  })
  status: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  author_amount: number; // Amount author receives (60/85/95 TL)

  @Column({
    type: DataType.ENUM(...Object.values(SubscriptionType)),
    allowNull: false,
  })
  buyer_plan_type: SubscriptionType; // Track buyer's plan at purchase time

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  transaction_id: string; // For IAP verification

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  completed_at: Date; // When purchase was completed

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  amount_paid: number; // Total amount paid by buyer

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_quota_purchase: boolean; // Whether purchase was made using quota
}
