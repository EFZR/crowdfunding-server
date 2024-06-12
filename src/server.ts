import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { testDbConnection } from "./utils/db";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();

// Logging.
app.use(morgan("common"));

// Json lecture data.
app.use(express.json());

// Database.
testDbConnection();

// Routes
app.use("/api/auth", authRoutes);

// CORS
/** TODO: CORS of app */

export default app;
