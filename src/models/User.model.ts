import {
  Table,
  Column,
  Model,
  DataType,
} from "sequelize-typescript";

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
}

export default User;
