import {
  Table,
  Column,
  Model,
  ForeignKey,
  CreatedAt,
  Index,
  DataType,
} from 'sequelize-typescript';
import { User } from '../users/users.entity';
import { Lecture } from '../lectures/lectures.entity';

@Table
export class FollowLecture extends Model<FollowLecture> {
  @ForeignKey(() => User)
  @Index('idx_follow_lecture_user')
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;

  @ForeignKey(() => Lecture)
  @Index('idx_follow_lecture_lecture')
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  lecture_id: number;
}
