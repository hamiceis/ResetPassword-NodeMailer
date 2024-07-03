import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  changePasswordHandler,
  requestPasswordResetHandler,
} from "../services/authService";
import { hashPassword } from "../lib/passHash";

//Controller que envia solicitação de alteração da senha
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const bodySchema = z.object({
      email: z.string().email(),
    });

    const { email } = bodySchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Email not found" });
    }
    //cria o resetToken e envia o link para resetar a senha
    await requestPasswordResetHandler(email);
    return res.status(200).send("Password reset link sent to your email");
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).send({ message: "ERROR REQUEST RESET PASSWORD" });
  }
};

//Controller que faz alteração da senha com o token e nova senha
export const changePassword = async (req: Request, res: Response) => {
  try {
    const queryParamsSchema = z.object({
      token: z.string(),
    });
    const bodySchema = z.object({
      password: z.string(),
    });

    const { token } = queryParamsSchema.parse(req.query);
    const { password } = bodySchema.parse(req.body);

    const newPassword = await hashPassword(password);

    await changePasswordHandler(token, newPassword);

    return res.status(200).send("Password has been reset");
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).send({ message: "ERROR REQUEST CHANGE PASSWORD" });
  }
};
