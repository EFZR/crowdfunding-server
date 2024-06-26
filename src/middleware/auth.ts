import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.model";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// TODO: Better handle errors.
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Get Bearer Token from req.
  const bearer = req.cookies["token"];
  if (!bearer) {
    const error = new Error("No autorizado.");
    return res.status(401).json({ error: error.message });
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
        const err = new Error("Token no Valido.");
        next(err);
      }
    }
  } catch (error) {
    const err = new Error("Token no Válido");
    next(err);
  }
}
