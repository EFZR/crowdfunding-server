import {
  Table,
  Column,
  PrimaryKey,
  Default,
  Model,
  DataType,
  ForeignKey,
  Unique,
  BeforeCreate,
  BelongsTo,
} from "sequelize-typescript";
import User from "./User.model";

@Table({
  tableName: "Session",
})
class Session extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public declare id: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public declare sessionToken: string;

  @ForeignKey(() => User)
  @Column
  public declare userId: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  public declare expiresAt: Date;

  @BelongsTo(() => User)
  public declare user: User;

  @BeforeCreate
  static setExpirationTime(instance: Session) {
    // Get the current date and time.
    const currentDate = new Date();

    // Set the expiration date for the token to 10 minutes ahead of the current time.
    instance.expiresAt = new Date(currentDate.getTime() + 10 * 60000);
  }
}

export default Session;
