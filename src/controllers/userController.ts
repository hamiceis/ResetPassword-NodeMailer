import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { checkPassword, hashPassword } from "../lib/passHash";

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: {
      request: true
    }
  })

  return res.status(200).json(users)
}


export const getUser = async (req: Request, res: Response) => {
  const paramsSchema = z.object({
    id: z.string()
  })
  try {

    const { id } = paramsSchema.parse(req.params)

    const user = await prisma.user.findFirst({
      where: {
        id
      },
      select: {
        name: true,
        email: true, 
      }
    })

    if(!user) {
      return res.status(401).json({ message: "User not found"})
    }


    return res.status(200).json(user)
  }catch(error: any) {
    console.log(error, 'get-user-error')
    return res.status(500).send("INTERNAL SERVER ERROR")
  }
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const createUserSchema = z.object({
      name: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { name, email, password } = createUserSchema.parse(req.body);

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
        name,
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
    res.setHeader("x-user-id", user.id);

    return res.status(200).json(user);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: "INTERNAL SERVER ERROR",
      error: error,
    });
  }
};

//usuário envia solicitação para o instructor
export const requestIntructor = async (req: Request, res: Response) => {
  const paramsSchema = z.object({
    instructorId: z.string()
  })
  const validationUserId = z.string().min(1)
  try { 
    //simula o usuário autenticado com seu userId nos headers
    const userId = validationUserId.parse(req.headers['x-user-id'])
    //Pega o Id do Instrutor pelos parametros da requisição
    const { instructorId } = paramsSchema.parse(req.params)

    //verifica se o usuário já enviou alguma solicitação
    const requestExist = await prisma.request.findFirst({
      where: {
        userId,
        instructorId
      }
    })

    if(requestExist) {
      return res.status(400).json({ message: "Request already sent"})
    }

    const newRequest = await prisma.request.create({
      data: {
        userId,
        instructorId
      }, 
    })

    return res.status(201).json(newRequest)
  } catch(error: any) {
    console.log(error);
    return res.status(500).json({ message: "INTERNAL SERVER ERROR - Request Instructor Error"})
  }
}

//usuário cancela a solicitação enviada
export const cancelRequest = async (req: Request, res: Response) => {
  const validationUserId = z.string().min(1)
  try {
    const userId = validationUserId.parse(req.headers['x-user-id'])
    const requestExist = await prisma.request.findFirst({
      where: {
        userId
      }
    })


    if(!requestExist) {
      return res.status(400).json({ message: "Request not found"})
    }

    await prisma.request.delete({
      where: {
        userId
      }
    })

    return res.status(200).send("Request cancelled successfully")
  }catch(error: any) {
    console.log(error);
    return res.status(500).json({ message: "INTERNAL SERVER ERROR - CANCEL REQUEST"})
  }
}