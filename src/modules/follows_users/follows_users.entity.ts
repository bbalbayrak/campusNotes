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
export class FollowsUsers extends Model<FollowsUsers> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  follower_id: number;

  @BelongsTo(() => User, 'follower_id')
  follower: User;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  following_id: number;

  @BelongsTo(() => User, 'following_id')
  following: User;
}
