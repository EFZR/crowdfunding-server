// Global dependencies.
import { Request, Response } from "express";
import axios from "axios";

// Project dependencies.
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/CustomError";
import { checkPassword, hashPassword } from "../utils/hash";
import { generateJWT } from "../utils/jwt";
import { logger } from "../utils/logging";
import User from "../models/User.model";

export class AuthController {
  static async createAccount(req: Request, res: Response) {
    const { email, username, password } = req.body;

    // Validation.
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      throw new BadRequestError({
        message: "El usuario ya esta registrado.",
        logging: true,
      });
    }

    // Hash Password
    const enc_password = await hashPassword(password);

    // Creation.
    await User.create({
      email,
      username,
      password: enc_password,
    });
    res.json({ success: "Usuario creado correctamente." });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    // Search User.
    const user = await User.findOne({ where: { email } });

    // Check if user exists.
    if (!user) {
      throw new NotFoundError({
        message: "Usuario no encontrado.",
        logging: true,
      });
    }

    // Check if user has a password.
    if (!user.password) {
      res.send(
        "Contraseña no definida. Revisa tu email para crear una contraseña."
      );
    }

    // Check Hashed password
    const isPasswordValid = await checkPassword(password, user.password);

    // Generate JWT
    const token = generateJWT({ id: user.id, email: user.email });

    if (!isPasswordValid) {
      throw new UnauthorizedError({
        message: "Contraseña Incorrecta.",
        logging: true,
      });
    }

    res.cookie("token", token, { httpOnly: true });
    res.json({ token: token });
  }

  static async googleAuthentication(req: Request, res: Response) {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: process.env.GOOGLE_RESPONSE_TYPE,
      scope: process.env.GOOGLE_SCOPE,
      include_granted_scopes: process.env.GOOGLE_INCLUDE_GRANTED_SCOPES,
      state: process.env.GOOGLE_STATE,
    });
    const uri = `${process.env.GOOGLE_AUTH_URI}?${params.toString()}`;

    res.redirect(uri);
  }

  static async googleCallback(req: Request, res: Response) {
    const code = req.query.code;

    // TODO: Check for any token if exists and validate to use it.
    // if not request for a new token.
    const { data } = await axios.post(process.env.GOOGLE_TOKEN_URI, {
      code,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
      grant_type: process.env.GOOGLE_GRANT_TYPE,
    });

    const { access_token } = data;
    const { data: userInfo } = await axios.get(
      process.env.GOOGLE_USER_INFO_URI,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    // Checking in database if user exists.
    const { email, given_name } = userInfo;
    let user = await User.findOne({
      where: {
        email,
      },
    });

    // Saving in database.
    if (!user) {
      logger.success("User saved.");
      user = await User.create({
        email,
        username: given_name,
      });
    }

    const token = generateJWT({ id: user.id, email: user.email });

    // TODO: Redirect to client Page & send JWT.
    res.cookie("token", token, { httpOnly: true });
    res.json({ token: token });
  }

  // TODO: Implement more oauth 2.0 options like meta and apple id.

  /** TODO:
   * confirmAccount,
   * requestConfirmationCode,
   * forgotPassword,
   * validatePasswordToken,
   * updatePasswordWithToken,
   * updateProfile,
   * updateCurrentUserWithPassword,
   * checkPassword */
}
