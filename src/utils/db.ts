import db from "../models/store/db";
import { success, critical } from "../utils/logging";

/** TODO: Handle Errors */
export function testDbConnection() {
  db.raw("SELECT 1")
    .then(() => success("Database Connection Succesful."))
    .catch((err) => critical(`Database Connection Error ${err}.`));
}
