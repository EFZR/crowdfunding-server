import knex from "knex";
import config from "../../../knexfile";

const environment = process.env.ENV;
const db = knex(config[environment]);

export default db;
