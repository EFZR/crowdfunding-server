import { Router } from "express";
import { body, query } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";

const router = Router();

router.post(
  "/create-account",
  body("username").notEmpty().withMessage("El Nombre no puede ir vacio."),
  body("password")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("El Password es muy corto, minimo 8 caracteres."),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Los password no son iguales.");
    }
    return true;
  }),
  body("email").isEmail().withMessage("E-mail no valido."),
  handleInputErrors,
  AuthController.createAccount
);

router.post(
  "/confirm-account",
  body("token").notEmpty().withMessage("El Token no puede ir vacio."),
  handleInputErrors,
  AuthController.confirmAccount
);

router.post(
  "/login",
  body("password").notEmpty().withMessage("El Password no puede ir vacio."),
  body("email").isEmail().withMessage("E-mail no valido."),
  handleInputErrors,
  AuthController.login
);

/** Third parties OAuth Authentication */

// Google

router.get("/google/authentication", AuthController.googleAuthentication);

router.get("/google/callback", AuthController.googleCallback);

// Facebook

export default router;
