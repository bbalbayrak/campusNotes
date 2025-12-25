import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Department } from '../departments/departments.entity';

@Table
export class Lecture extends Model<Lecture> {
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
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  semester: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  grade: string;
}
