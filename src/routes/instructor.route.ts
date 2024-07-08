import { Router } from "express";
import { createInstructorController, getAllInstructors } from "../controllers/instructorController";

export const instructorRouter = Router()


//Lista todos os instrutores
instructorRouter.get('/instructors', getAllInstructors)

//Cria uma Instructor
instructorRouter.post("/instructors", createInstructorController)