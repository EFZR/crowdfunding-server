import { Request, Response } from "express";
import axios from "axios";
import { logger } from "../utils/logging";
import { checkPassword, hashPassword } from "../utils/hash";
import User from "../models/User.model";

type UserForCreate = {
  email: string;
  username: string;
  password: string;
};

export class AuthController {
  static async createAccount(req: Request, res: Response) {
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
  }

  // TODO: JWT Implementation
  static async login(req: Request, res: Response) {
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
  }

  static async googleAuthentication(req: Request, res: Response) {
    try {
      const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        response_type: process.env.RESPONSE_TYPE,
        scope: process.env.SCOPE,
        include_granted_scopes: process.env.INCLUDE_GRANTED_SCOPES,
        state: process.env.STATE,
      });
      const uri = `${process.env.AUTH_URI}?${params.toString()}`;
      console.log(uri);
      res.redirect(uri);
    } catch (error) {
      logger.critical(error);
      res.status(500).json({ error: "Error interno." });
    }
  }

  static async googleCallback(req: Request, res: Response) {
    try {
      const code = req.query.code;
      const { data } = await axios.post(process.env.TOKEN_URI, {
        code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: process.env.GRANT_TYPE,
      });

      const { access_token } = data;
      const { data: userInfo } = await axios.get(process.env.USER_INFO_URI, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      // TODO: Save User Info into database and find a way to automatically login

      logger.success(userInfo);

      // TODO: Redirect to client Page.
      // res.send(access_token);
    } catch (error) {
      logger.critical(error);
      res.status(500).json({ error: "Error interno." });
    }
  }
}
