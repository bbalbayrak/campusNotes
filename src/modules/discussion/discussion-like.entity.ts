import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.entity';
import { Discussion } from './discussion.entity';

@Table
export class DiscussionLike extends Model<DiscussionLike> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Discussion)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  discussion_id: number;

  @BelongsTo(() => Discussion)
  discussion: Discussion;
}
