import type { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();

/**
 * Config file to connect to database
 * TODO: Find a way to make migrations from sql files.
 */

const connectionValues = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_USER_PWD,
  database: process.env.DB_DATABASE,
};

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: connectionValues,
    pool: {
      min: 2,
      max: 10,
    },
  },

  staging: {
    client: "pg",
    connection: connectionValues,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },

  production: {
    client: "pg",
    connection: connectionValues,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};

export default config;
