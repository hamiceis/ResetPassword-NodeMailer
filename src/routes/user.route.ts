import { Router } from "express"

import { createUser, getAllUsers, getUser, userLogin } from "../controllers/userController"

export const userRouter = Router()

userRouter.post("/users", createUser)

userRouter.post("/login", userLogin)

userRouter.get("/users", getAllUsers)

userRouter.get("/users/:id", getUser)