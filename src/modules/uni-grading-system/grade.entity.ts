// user-grade.entity.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
//import { GradingTerm } from './grading-term.entity';

@Table
export class UserGrade extends Model {
  @Column({ allowNull: false })
  courseName: string;

  @Column({ type: DataType.INTEGER, defaultValue: 3 })
  credit: number;

  @Column({ type: DataType.FLOAT, allowNull: true })
  vizeNote: number;

  @Column({ type: DataType.FLOAT, allowNull: true })
  finalNote: number;

  @Column({ type: DataType.INTEGER, defaultValue: 40 })
  vizeWeight: number;

  @Column({ type: DataType.INTEGER, defaultValue: 60 })
  finalWeight: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  finalPassLimit: number;

  // Hesaplama Tipi
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isBellCurve: boolean; // True ise Çan Eğrisi parametreleri zorunlu olacak

  // Çan Eğrisi Parametreleri (Opsiyonel)
  @Column({ type: DataType.FLOAT, allowNull: true })
  classAverage: number;

  @Column({ type: DataType.FLOAT, allowNull: true })
  standardDeviation: number;

  @Column({ type: DataType.JSONB, allowNull: true })
  customThresholds: any; // Kullanıcıya özel harf sınırları (Mutlak veya T-Skoru)

  //   @ForeignKey(() => GradingTerm)
  //   @Column({ allowNull: false })
  //   termId: number;

  //   @BelongsTo(() => GradingTerm)
  //   term: GradingTerm;
}
