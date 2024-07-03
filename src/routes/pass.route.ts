import { Router } from "express";
import { changePassword, requestPasswordReset } from "../controllers/authController";

export const passRouter = Router()
//Rota para envia o reset da senha
passRouter.post("/request-password-reset", requestPasswordReset)

//rota para alterar a senha
passRouter.post("/reset-password", changePassword)