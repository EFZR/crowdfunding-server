import db from "../models/store/db";
import { critical } from "../utils/logging";

type User = {
  id: number;
  username: string;
};

type UserForCreate = {
  username: string;
  pwd_clear: string;
};

type UserForInsert = {
  username: string;
};

type UserForLogin = {
  id: number;
  username: string;
  password: string;
  password_salt: string;
  token_salt: string;
};

export class UserBmc {
  static table = "users";

  static async createUser(user: UserForCreate): Promise<User["id"]> {
    try {
      const { username, pwd_clear } = user;

      // -- Create the user.
      const user_fi: UserForInsert = {
        username,
      };

      // -- Start the creation.
      const [{ id: userId }] = await db
        .insert(user_fi)
        .into(this.table)
        .returning("id");

      // -- Update User With Password.
      this.updatePassword(userId, pwd_clear);

      return userId;
    } catch (error) {
      critical(error.message);
    }
  }

  static async getUserById(userId: User["id"]) {}

  static async getUserByUsername(username: User["username"]) {}

  static async updatePassword(
    userId: User["id"],
    pwd_clear: UserForCreate["pwd_clear"]
  ) {}
}
