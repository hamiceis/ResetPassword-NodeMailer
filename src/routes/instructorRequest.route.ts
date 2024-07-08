import { Router } from "express";
import { acceptOrRecusedRequest, listRequests } from "../controllers/instructorController";

export const instructorRequestRouter = Router()

instructorRequestRouter.get("/:id/requests", listRequests) //Lista todas as solicitações pendentes "pending"

instructorRequestRouter.post("/response-request", acceptOrRecusedRequest) // aceita ou recusa as solicitações 
