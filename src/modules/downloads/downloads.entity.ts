import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.entity';
import { Note } from '../notes/notes.entity';

@Table
export class Downloads extends Model<Downloads> {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  user_id: number;

  @ForeignKey(() => Note)
  @Column({ type: DataType.INTEGER, allowNull: false })
  note_id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  downloaded_at: Date;
}
