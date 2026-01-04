import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.entity';
import { Note } from '../notes/notes.entity';

@Table({
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'note_id'],
    },
  ],
})
export class NoteBookmark extends Model<NoteBookmark> {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Note)
  @Column({ type: DataType.INTEGER, allowNull: false })
  note_id: number;

  @BelongsTo(() => Note)
  note: Note;
}
