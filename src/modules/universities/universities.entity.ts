import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class University extends Model<University> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  country: string;
}
