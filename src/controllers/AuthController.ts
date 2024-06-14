import { Request, Response } from "express";
import { logger } from "../utils/logging";
import User from "../models/User.model";
import { checkPassword, hashPassword } from "../utils/hash";

type UserForCreate = {
  email: string;
  username: string;
  password: string;
};

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    // TODO: OAuth implementation
    try {
      const { email, username, password } = req.body;

      // Validation.
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        const error = new Error("El usuario ya esta registrado.");
        return res.status(409).json({ error: error.message });
      }

      // Hash Password
      const enc_password = await hashPassword(password);

      // Creation.
      const user_fc: UserForCreate = {
        email,
        username,
        password: enc_password,
      };

      await User.create(user_fc);

      res.send("Usuario creado correctamente.");
    } catch (error) {
      logger.critical(error);
      res.status(500).json({ error: "Error interno." });
    }
  };

  // TODO: JWT Implementation
  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Search User.
      const user = await User.findOne({ where: { email } });
      if (!user) {
        const error = new Error("Usuario no encontrado.");
        return res.status(404).json({ error: error.message });
      }

      // Check Hashed password
      const isPasswordValid = checkPassword(password, user.password);
      if (!isPasswordValid) {
        const error = new Error("La contraseña es incorrecta.");
        return res.status(401).json({ error: error.message });
      }

      return res.send("Autenticando...");
    } catch (error) {
      logger.critical(error);
      res.status(500).json({ error: "Error interno." });
    }
  };

  static logoff = async (req: Request, res: Response) => {
    try {
    } catch (error) {
      logger.critical(error);
      res.status(500).json({ error: "Error interno." });
    }
  };
}
