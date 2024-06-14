import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import { logger } from "../utils/logging";

/** TODO: Error handling */

dotenv.config();

const db = new Sequelize(process.env.DATABASE_URL, {
  models: [__dirname + "/../models/**/*"],
  logging: false,
});

export async function connectDb() {
  try {
    await db.authenticate();
    await db.sync();
    logger.success("Conexion exitosa a la base de datos.");
  } catch (error) {
    logger.critical("Hubo un error al conectar a la base de datos.");
  }
}
