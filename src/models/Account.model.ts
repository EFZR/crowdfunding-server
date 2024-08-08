import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
  BelongsTo,
} from "sequelize-typescript";
import User from "./User.model";

@Table({
  tableName: "Account",
})
class Account extends Model {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public declare provider: string;

  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public declare providerAccountId: string;

  @ForeignKey(() => User)
  @Column
  public declare userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public declare type: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public declare refresh_token: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public declare access_token: string | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  public declare expires_at: number | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public declare token_type: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public declare scope: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public declare id_token: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public declare session_state: string | null;

  @BelongsTo(() => User)
  public declare user: User;
}

export default Account;
