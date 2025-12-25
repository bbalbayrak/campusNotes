import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.entity';

@Table
export class Report extends Model<Report> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  target_type: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  target_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  reporter_id: number;

  @BelongsTo(() => User)
  reporter: User;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  reason: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'pending',
  })
  status: string;
}
