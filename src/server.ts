// Global dependencies.
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import "express-async-errors";

// Project dependencies.
import authRoutes from "./routes/authRoutes";
import { connectDb } from "./config/db";
import { corsConfig } from "./config/cors";
import { errorHandler } from "./middleware/errors";

dotenv.config();

const app = express();

// Logging.
app.use(morgan("dev"));

// Json lecture data.
app.use(express.json());

// Cookies utilities.
app.use(cookieParser());

/** TODO: Init database with a .sql file */
// Database.
connectDb();

// Routes
app.use("/api/auth", authRoutes);

// CORS
app.use(cors(corsConfig[process.env.ENV]));

// Error Handling
app.use(errorHandler);

export default app;
