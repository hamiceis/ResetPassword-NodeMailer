import { Router } from "express";
import { cancelRequest, requestIntructor } from "../controllers/userController";

export const userRequestRouter = Router();

userRequestRouter.post("/send-request/:instructorId", requestIntructor) //aluno envia solicitação para instructor
userRequestRouter.delete("/cancel-request", cancelRequest) //aluno cancela solicitação enviada!

