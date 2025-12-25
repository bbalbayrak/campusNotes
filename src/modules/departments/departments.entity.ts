import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { University } from '../universities/universities.entity';

@Table
export class Department extends Model<Department> {
  @ForeignKey(() => University)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  university_id: number;

  @BelongsTo(() => University)
  university: University;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;
}
