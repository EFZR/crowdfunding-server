import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import User from "../models/User.model";
import { UnauthorizedError } from "../utils/CustomError";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Get Bearer Token from req.
  const bearer = req.headers.authorization;
  if (!bearer) {
    throw new UnauthorizedError({
      message: "Acceso no autorizado.",
      logging: true,
    });
  }
  const [_, token] = bearer.split(" ");

  // Decode JWT.
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof decoded === "object" && decoded.id) {
      const user = await User.findByPk(decoded.id);
      if (user) {
        req.user = user;
        next();
      } else {
        // TODO: Check for any token if exists and validate to use it.
        // if not request for a new token.
        throw new UnauthorizedError({
          message: "Token no Valido.",
          logging: true,
        });
      }
    }
  } catch (error) {
    throw new UnauthorizedError({
      message: "Token no Valido.",
      logging: true,
    });
  }
}
