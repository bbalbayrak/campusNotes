import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.entity';
import { Lecture } from '../lectures/lectures.entity';

@Table
export class Note extends Model<Note> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  author_id: number;

  @BelongsTo(() => User)
  author: User;

  @ForeignKey(() => Lecture)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  lecture_id: number;

  @BelongsTo(() => Lecture)
  lecture: Lecture;

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
    type: DataType.STRING,
    allowNull: true,
  })
  file_url: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  file_type: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  })
  price: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_paid: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'pending',
  })
  status: string;
}
