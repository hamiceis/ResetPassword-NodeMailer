import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/passHash";

export async function getAllInstructors(req: Request, res: Response) {
  const instructors = await prisma.instructor.findMany({
    include: {
      requests: true,
      users: true,
    }
  });
  return res.status(200).json(instructors);
}

export const createInstructorController = async (
  req: Request,
  res: Response
) => {
  const bodySchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
  });

  try {
    const { name, email, password } = bodySchema.parse(req.body);

    const emailExist = await prisma.instructor.findUnique({
      where: {
        email,
      },
    });

    if (emailExist) {
      return res.status(401).json({ message: "Email already exist" });
    }

    const hashPass = await hashPassword(password);

    const newInstructor = await prisma.instructor.create({
      data: {
        name,
        email,
        password: hashPass,
      },
    });

    return res.status(201).json(newInstructor);
  } catch (error: any) {
    console.log("ERROR_ROUTE_CREATE_INSTRUCTOR", error);
    return res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
  }
};

export const listRequests = async (req: Request, res: Response) => {
  const paramsSchema = z.object({
    id: z.string(),
  });
  try {
    const { id } = paramsSchema.parse(req.params);

    const requests = await prisma.request.findMany({
      where: {
        instructorId: id,
        status: "pending",
      },
      select: {
        id: true,
        userId: true
      }
    });

    if (requests.length === 0) {
      return res.status(404).json({ message: "No requests found" });
    }

    return res.status(200).json(requests);
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "INTERNAL SERVER ERROR - List requests" });
  }
};

export const acceptOrRecusedRequest = async (req: Request, res: Response) => {
  const bodySchema = z.object({
    requestId: z.string().min(1),
    instructorId: z.string().min(1),
    status: z.enum(["accepted", "recused"]),
  });
  try {
    const { requestId, instructorId, status } = bodySchema.parse(req.body);

    const requestExist = await prisma.request.findUnique({
      where: {
        id: requestId,
      },
      select: {
        status: true,
        userId: true,
      }
    });

    if (!requestExist) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (status === "accepted") {
      const request = await prisma.request.update({
        where: {
          id: requestId,
        },
        data: {
          status: "accepted",
          instructorId
        },
      });

      //adiciona um instructorId
      await prisma.user.update({
        where: {
          id: requestExist.userId,
        },
        data: {
          instructorId
        },
      });

      return res.status(200).json(request);
    }

    if (status === "recused") {
      await prisma.request.delete({
        where: {
          id: requestId,
        },
      });
      return res
        .status(200)
        .json({ message: "Request recused and removed successfully" });
    }
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "INTERNAL SERVER ERROR - List requests" });
  }
};
