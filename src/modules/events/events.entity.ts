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
export class Event extends Model<Event> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  scope_type: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  scope_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  event_date: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  created_by: number;

  @BelongsTo(() => User)
  creator: User;
}
