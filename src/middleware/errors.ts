import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logging";
import { CustomError } from "../utils/CustomError";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Handled Errors.
  if (err instanceof CustomError) {
    const { statusCode, errors, logging } = err;
    if (logging) {
      logger.critical(
        JSON.stringify(
          {
            code: err.statusCode,
            errors: err.errors,
            stack: err.stack,
          },
          null,
          2
        )
      );

      return res.status(statusCode).send({ errors });
    }
  }

  // Unhandled errors
  console.error(JSON.stringify(err, null, 2));
  res.status(500).json({ error: "Error interno" });
}
