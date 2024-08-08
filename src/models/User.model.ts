import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  Default,
  PrimaryKey,
} from "sequelize-typescript";
import Token from "./Token.model";

@Table({
  tableName: "User",
})
class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public declare id: string;

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
    type: DataType.STRING,
    allowNull: true,
  })
  public declare image: string | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  public declare confirmed: boolean;

  @HasMany(() => Token)
  token: Token[];
}

export default User;
