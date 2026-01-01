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
import { NoteStatus } from './noteStatus';

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
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  view_count: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  download_count: number;

  @Column({
    type: DataType.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0,
  })
  average_rating: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_free: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(NoteStatus)),
    allowNull: true,
    defaultValue: NoteStatus.PENDING,
  })
  status: string;

  @Column({ type: DataType.STRING, allowNull: true })
  preview_image_url: string;
}
