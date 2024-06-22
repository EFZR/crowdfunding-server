// Global dependencies.
import { Request, Response } from "express";
import axios from "axios";

// Project dependencies.
import { checkPassword, hashPassword } from "../utils/hash";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/CustomError";
import { logger } from "../utils/logging";
import User from "../models/User.model";

type UserForCreate = {
  email: string;
  username: string;
  password: string;
};

export class AuthController {
  static async createAccount(req: Request, res: Response) {
    const { email, username, password } = req.body;

    // Validation.
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      throw new BadRequestError({message: "El usuario ya esta registrado.", logging: true});
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
  }

  // TODO: JWT Implementation
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    // Search User.
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundError({message: "Usuario no encontrado.", logging: true});
    }

    // Check Hashed password
    const isPasswordValid = checkPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError({message: "Usuario no encontrado.", logging: true});
    }

    return res.send("Autenticando...");
  }

  static async googleAuthentication(req: Request, res: Response) {
    const params = new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      redirect_uri: process.env.REDIRECT_URI,
      response_type: process.env.RESPONSE_TYPE,
      scope: process.env.SCOPE,
      include_granted_scopes: process.env.INCLUDE_GRANTED_SCOPES,
      state: process.env.STATE,
    });
    const uri = `${process.env.AUTH_URI}?${params.toString()}`;
    res.redirect(uri);
  }

  static async googleCallback(req: Request, res: Response) {
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

    // Checking in database if user exists.
    const { email, given_name } = userInfo;
    const user = User.findOne({
      where: {
        email,
      },
    });

    // Saving in database.
    if (!user) {
      logger.success("user is saving.");
      await User.create({
        email,
        username: given_name,
      });
    }

    // TODO: Redirect to client Page & send JWT.
    // res.send();
  }
}
