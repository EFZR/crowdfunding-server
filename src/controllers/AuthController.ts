import { Request, Response } from "express";
import { UserBmc } from "../models/UserModel";
import { success, critical } from "../utils/logging";

export class AuthController {
  static login = async (req: Request, res: Response) =>
    res.send("Inside login...");
  static logoff = async (req: Request, res: Response) =>
    res.send("Inside logoff...");
  static register = async (req: Request, res: Response) =>
    res.send("Inside register...");
}
