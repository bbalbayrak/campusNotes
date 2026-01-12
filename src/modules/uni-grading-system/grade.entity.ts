import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class UniGrade extends Model<UniGrade> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: 'Şablon adı (Örn: KTÜ Bağıl, Standart 4lük, 100lük)',
  })
  templateName: string;

  @Column({
    type: DataType.ENUM('MUTLAK', 'BAGIL'),
    defaultValue: 'MUTLAK',
  })
  systemType: string;

  @Column({ type: DataType.INTEGER, defaultValue: 40 })
  vizeWeight: number;

  @Column({ type: DataType.INTEGER, defaultValue: 60 })
  finalWeight: number;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    comment: 'Harf katsayıları: { "AA": 4.0, "BA": 3.5 }',
  })
  gradePoints: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Mutlak sistemse baraj puanları: { "AA": 90, "BA": 80 }',
  })
  scoreRanges: any;
}
