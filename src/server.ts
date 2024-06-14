import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes";
import { connectDb } from "./config/db";
import { corsConfig } from "./config/cors";

dotenv.config();

const app = express();

// Logging.
app.use(morgan("dev"));

// Json lecture data.
app.use(express.json());

/** TODO: Init database with a .sql file */
// Database.
connectDb();

// Routes
app.use("/api/auth", authRoutes);

// CORS
app.use(cors(corsConfig[process.env.ENV]));

export default app;
