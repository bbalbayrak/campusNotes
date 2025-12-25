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
export class AuditLog extends Model<AuditLog> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  action: string;

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

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  ip_address: string;
}
