import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/modules/users/users.entity';

@Table
export class AuthSession extends Model<AuthSession> {
  @ForeignKey(() => User)
  @Index
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @Index
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  refresh_token_hash: string;

  @Column(DataType.TEXT)
  user_agent: string;

  @Column(DataType.STRING)
  ip_address: string;

  @Index
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expires_at: Date;
}
