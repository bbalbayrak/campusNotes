import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.entity';
import { Note } from '../notes/notes.entity';

@Table
export class Earnings extends Model<Earnings> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number; // uploader

  @ForeignKey(() => Note)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  note_id: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  gross_amount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  uploader_amount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  platform_amount: number;

  @Column({
    type: DataType.ENUM('IAP'),
    allowNull: false,
  })
  source: string;

  @Column({
    type: DataType.ENUM('PENDING', 'CONFIRMED', 'REFUNDED'),
    defaultValue: 'CONFIRMED',
  })
  status: string;
}
