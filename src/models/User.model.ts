import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import Token from "./Token.model";

@Table({
  tableName: "Users",
})
class User extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  public declare username: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  public declare email: string;

  @Column({
    type: DataType.STRING,
  })
  public declare password: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  public declare confirmed: boolean;

  @HasMany(() => Token)
  token: Token[];
}

export default User;
