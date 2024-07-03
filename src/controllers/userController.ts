import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { checkPassword, hashPassword } from "../lib/passHash";

export const createUser = async (req: Request, res: Response) => {
  try {
    const createUserSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { email, password } = createUserSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      return res.status(401).send("Email already exists");
    }

    const hashPass = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashPass,
      },
    });
    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "INTERNAL SERVER ERROR",
      error: error,
    });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  try {
    const userLoginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { email, password } = userLoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).send("Email or password not found");
    }

    const isPasswordValid = await checkPassword(user.password, password);

    if (!isPasswordValid) {
      return res.status(401).send("password is incorrect");
    }

    return res.status(200).json(user);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: "INTERNAL SERVER ERROR",
      error: error,
    });
  }
};



export const getAllUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany()

  return res.status(200).json(users)
}