import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { UserPlanType, UserType } from './userTypes';

@Table
export class User extends Model<User> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.ENUM,
    values: Object.values(UserType),
    allowNull: false,
  })
  role: UserType;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  verified: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  trust_score: number;

  @Column({
    type: DataType.ENUM(...Object.values(UserPlanType)),
    allowNull: false,
    defaultValue: UserPlanType.FREE,
  })
  plan_type: UserPlanType;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  plan_expires_at: Date | null;
}
