import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  BeforeCreate,
} from "sequelize-typescript";
import User from "./User.model";

@Table({
  tableName: "Token",
})
class Token extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public declare token: string;

  @ForeignKey(() => User)
  @Column
  public declare userId: number;

  @BelongsTo(() => User)
  public declare user: User;

  @Column({
    type: DataType.DATE,
  })
  public declare expiresAt: Date;

  @BeforeCreate
  static setExpirationTime(instance: Token) {
    // Get the current date and time.
    const currentDate = new Date();

    // Set the expiration date for the token to 10 minutes ahead of the current time.
    instance.expiresAt = new Date(currentDate.getTime() + 10 * 60000);
  }
}

export default Token;
