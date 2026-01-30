import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.entity';
import { Department } from '../departments/departments.entity';
import { DiscussionStatus } from './status';

@Table
export class Discussion extends Model<Discussion> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  author_id: number;

  @BelongsTo(() => User, 'author_id')
  author: User;

  @ForeignKey(() => Department)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  department_id: number;

  @BelongsTo(() => Department)
  department: Department;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  comment_count: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  like_count: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_pinned: boolean; // Admins can pin important discussions

  @Column({
    type: DataType.ENUM(...Object.values(DiscussionStatus)),
    allowNull: false,
    defaultValue: DiscussionStatus.APPROVED,
  })
  status: DiscussionStatus;
}
