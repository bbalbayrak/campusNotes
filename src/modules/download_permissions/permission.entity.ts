import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.entity';
import { Note } from '../notes/notes.entity';
import { DownloadPermissionSource } from './permission.sources';

@Table
export class DownloadPermission extends Model<DownloadPermission> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @ForeignKey(() => Note)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  noteId: number;

  @Column({
    type: DataType.ENUM(...Object.values(DownloadPermissionSource)),
    allowNull: false,
  })
  source: DownloadPermissionSource;

  @Column({ type: DataType.DATE, allowNull: true })
  expiresAt: Date | null;
}
