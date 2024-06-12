import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes";
import { testDbConnection } from "./utils/db";
import { corsConfig } from "./config/cors";

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
app.use(cors(corsConfig[process.env.ENV]));

export default app;
