import { transporter } from "../config/nodemailer";

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  static async sendConfirmationEmail(user: IEmail) {
    const info = await transporter.sendMail({
      from: "CrowdFunding <admin@crowdfunding.com>",
      to: user.email,
      subject: "CrowdFunding - Confirma tu cuenta",
      text: "CrowdFunding - Confirma tu cuenta.",
      html: `<p>Hola: ${user.name}, has creado tu cuenta en CrowdFunding, ya casi esta todo listo, solo debes confirmar tu cuenta.</p>
            <p>Visita el siguiente enlace</p>
            <a href="${process.env.FRONTEND_URL}/authentication/confirmation">Confirma tu cuenta</a>
            <p>E ingresa el codigo: <b>${user.token}</b></p>
            <p>Este token expira en 10 minutos</p>`,
    });
    console.log(info.messageId);
  }

  static async sendPasswordResetToken(user: IEmail) {
    const info = await transporter.sendMail({
      from: "CrowdFunding <admin@crowdfunding.com>",
      to: user.email,
      subject: "CrowdFunding - Restablece tu password",
      text: "CrowdFunding - Confirma tu cuenta.",
      html: `<p>Hola: ${user.name}, has solicitado restablecer tu password.</p>
            <p>Visita el siguiente enlace</p>
            <a href="${process.env.FRONTEND_URL}/authentication/newPassword">Restablecer Password</a>
            <p>E ingresa el codigo: <b>${user.token}</b></p>
            <p>Este token expira en 10 minutos</p>`,
    });
    console.log(info.messageId);
  }
}
