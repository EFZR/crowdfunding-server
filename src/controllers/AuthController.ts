// Global dependencies.
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";

// Project dependencies.
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/CustomError";
import { checkPassword, hashPassword } from "../utils/hash";
import { generateJWT } from "../utils/jwt";
import { logger } from "../utils/logging";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import User from "../models/User.model";
import Token from "../models/Token.model";
import { accountType, providerType } from "../types/Auth";
import Account from "../models/Account.model";
import { authValidation } from "../utils/oauth";

/**
 * FIX:
 *
 * - Account management when user already exists.
 * - Check Expire time of token.
 *
 */

export class AuthController {
  static async createAccount(req: Request, res: Response) {
    const { email, username, password } = req.body;

    // Validate if the user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      throw new BadRequestError({
        message: "El usuario ya está registrado.",
        logging: true,
      });
    }

    // Hash the password before saving to the database
    const hashedPassword = await hashPassword(password);

    // Prepare the user payload
    const userPayload = {
      email,
      username,
      password: hashedPassword,
    };

    // Create the user in the database
    const newUser = await User.create(userPayload);

    // Create user's account
    const accountPayload = {
      provider: providerType.enum.local,
      providerAccountId: newUser.email,
      userId: newUser.id,
      type: accountType.enum.password,
    };

    await Account.create(accountPayload);

    // Generate and save the token
    const tokenPayload = {
      token: generateToken(),
      userId: newUser.id,
    };

    const token = await Token.create(tokenPayload);

    // Send Email.
    AuthEmail.sendConfirmationEmail({
      email: newUser.email,
      name: newUser.username,
      token: token.token,
    });

    // Respond with a success message
    res.json({ success: "Cuenta creada, revisa tu email para confirmarla." });
  }

  static async confirmAccount(req: Request, res: Response) {
    const { token } = req.body;
    const tokenExists = await Token.findOne({ where: { token } });

    // Validate if token exists.
    if (!tokenExists) {
      throw new NotFoundError({
        message: "Token no Valido",
        logging: true,
      });
    }

    // Check if token still valid.
    const currentDate = new Date();
    if (currentDate > tokenExists.expiresAt) {
      throw new UnauthorizedError({
        message: "Token Expirado, consulta por uno nuevo.",
        logging: true,
      });
    }

    // Update confirmed user and delete used token.
    await Promise.allSettled([
      User.update(
        { confirmed: true },
        {
          where: {
            id: tokenExists.userId,
          },
        }
      ),
      Token.destroy({
        where: { token },
      }),
    ]);

    // Respond with a success message
    res.json({
      success: "Cuenta confirmada correctamente.",
    });
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

    // Check if user is confirmed.
    if (!user.confirmed) {
      // Generate and save the token
      const tokenPayload = {
        token: generateToken(),
        userId: user.id,
      };
      const token = await Token.create(tokenPayload);

      // Send Email.
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.username,
        token: token.token,
      });

      throw new UnauthorizedError({
        message:
          "La cuenta no ha sido confirmada, hemos enviado un email de confirmacion.",
        logging: true,
      });
    }

    // Check Hashed password
    const isPasswordValid = await checkPassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError({
        message: "Contraseña Incorrecta.",
        logging: true,
      });
    }

    // Generate JWT
    const token = generateJWT({ id: user.id, email: user.email });

    res.json({ token: token });
  }

  static async requestConfirmationCode(req: Request, res: Response) {
    const { email } = req.body;

    // Validate if the user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundError({
        message: "El usuario no esta registrado.",
        logging: true,
      });
    }

    // Prevent token from confirmed users
    if (user.confirmed) {
      throw new ForbiddenError({
        message: "El usuario ya esta confirmado.",
        logging: true,
      });
    }

    // Generate and save the token
    const tokenPayload = {
      token: generateToken(),
      userId: user.id,
    };

    const token = await Token.create(tokenPayload);

    // Send Email.
    AuthEmail.sendConfirmationEmail({
      email: user.email,
      name: user.username,
      token: token.token,
    });

    res.json({ success: "Se envió un nuevo token a tu E-mail." });
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    // Validate if the user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundError({
        message: "El usuario no esta registrado.",
        logging: true,
      });
    }

    // Generate and save the token
    const tokenPayload = {
      token: generateToken(),
      userId: user.id,
    };

    const token = await Token.create(tokenPayload);

    // Send Email.
    AuthEmail.sendPasswordResetToken({
      email: user.email,
      name: user.username,
      token: token.token,
    });

    res.json({ success: "Revisa tu E-Mail para instrucciones." });
  }

  static async validatePasswordToken(req: Request, res: Response) {
    const { token } = req.body;
    const tokenExists = await Token.findOne({ where: { token } });

    // Validate if token exists.
    if (!tokenExists) {
      throw new NotFoundError({
        message: "Token no Valido",
        logging: true,
      });
    }

    res.json({ success: "Token valido, define tu nueva contraseña" });
  }

  static async updatePasswordWithToken(req: Request, res: Response) {
    const { token } = req.params;
    const { password } = req.body;
    const tokenExists = await Token.findOne({ where: { token } });

    // Validate if token exists.
    if (!tokenExists) {
      throw new NotFoundError({
        message: "Token no Valido",
        logging: true,
      });
    }

    // Hash the password before saving to the database
    const hashedPassword = await hashPassword(password);

    // Update confirmed user and delete used token.
    await Promise.allSettled([
      User.update(
        { password: hashedPassword },
        {
          where: {
            id: tokenExists.userId,
          },
        }
      ),
      Token.destroy({
        where: { token },
      }),
    ]);

    res.json({ success: "El password se modificó correctamente." });
  }

  static async user(req: Request, res: Response) {
    res.json(req.user);
  }

  static async refreshToken(req: Request, res: Response) {
    // Get Token from body.
    const { token } = req.body;

    // Decode JWT.
    const decoded = jwt.decode(token);
    if (typeof decoded === "object" && decoded.id) {
      const account = await Account.findOne({
        where: {
          userId: decoded.id,
        },
      });

      if (!account) {
        throw new UnauthorizedError({
          message: "Token no Valido.",
          logging: true,
        });
      }

      const isValid = await authValidation[account.provider](account);

      if (!isValid) {
        throw new UnauthorizedError({
          message:
            "Autenticación expirada. Por favor, inicia sesión nuevamente.",
          logging: true,
        });
      }

      // Generate JWT
      const user = await User.findByPk(account.userId);
      const token = generateJWT({ id: user.id, email: user.email });
      res.json({ token: token });
    }
  }

  static async googleAuthentication(req: Request, res: Response) {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: process.env.GOOGLE_RESPONSE_TYPE,
      scope: process.env.GOOGLE_SCOPE,
      include_granted_scopes: process.env.GOOGLE_INCLUDE_GRANTED_SCOPES,
      state: process.env.GOOGLE_STATE,
      access_type: process.env.GOOGLE_ACCESS_TYPE,
    });

    const uri = `${process.env.GOOGLE_AUTH_URI}?${params.toString()}`;

    res.redirect(uri);
  }

  static async googleCallback(req: Request, res: Response) {
    const code = req.query.code;

    if (!code) {
      throw new BadRequestError({
        message: "Authorization code is missing",
        logging: true,
      });
    }

    // Request for a new token.
    const tokenResponse = await axios.post(process.env.GOOGLE_TOKEN_URI, {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: process.env.GOOGLE_GRANT_TYPE,
    });

    const {
      access_token,
      refresh_token,
      expires_in: expires_at,
      token_type,
      scope,
      id_token,
    } = tokenResponse.data;

    // Retrieve user info from Google.
    const userInfoResponse = await axios.get(process.env.GOOGLE_USER_INFO_URI, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // Checking in database if user exists.
    const {
      email,
      given_name: username,
      picture: image,
    } = userInfoResponse.data;

    let user = await User.findOne({
      where: {
        email,
      },
    });

    // Create User if don't exists.
    if (!user) {
      user = await User.create({ email, username, image });

      // Create user's account
      const accountPayload = {
        provider: providerType.enum.google,
        providerAccountId: user.email,
        userId: user.id,
        type: accountType.enum.oauth,
        refresh_token,
        access_token,
        expires_at,
        token_type,
        scope,
        id_token,
      };

      await Account.create(accountPayload);

      // Generate and save the token
      const tokenPayload = {
        token: generateToken(),
        userId: user.id,
      };

      const token = await Token.create(tokenPayload);

      // Send confirmation email.
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.username,
        token: token.token,
      });

      logger.success("User and account saved.");

      // Redirect with success message
      const message = "Cuenta creada, revisa tu email para confirmarla.";
      res.redirect(
        `${
          process.env.FRONTEND_URL
        }/authentication/login?message=${encodeURIComponent(message)}`
      );
    }

    // Update existing user's account
    else {
      await Account.update(
        {
          refresh_token,
          access_token,
          expires_at,
          token_type,
          scope,
          id_token,
        },
        {
          where: {
            userId: user.id,
          },
        }
      );

      // Generate JWT and set Cookie.
      const token = generateJWT({ id: user.id, email: user.email });
      res.cookie("token", token, { httpOnly: true });
      res.redirect(`${process.env.FRONTEND_URL}/`);
    }
  }

  // TODO: Implement more oauth 2.0 options like facebook

  /**
   * TODO: Implement when needed
   *
   * static async updateProfile(req: Request, res: Response) {}
   *
   * static async updateCurrentUserWithPassword(req: Request, res: Response) {}
   *
   * static async checkPassword(req: Request, res: Response) {}
   */
}
