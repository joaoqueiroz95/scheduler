import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/libs/prismadb";
import bcrypt from "bcrypt";
import { Prisma, Role, User } from "@prisma/client";
import { checkAuth } from "@/middlewares/auth";
import { checkRoles } from "@/middlewares/permissions";
import { isManagerUser } from "@/libs/role";
import { getLoggedUser } from "@/libs/session";
import { validateForm } from "@/middlewares/form";
import { createUserSchema } from "@/constants/schemas/user";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      return await checkAuth(checkRoles(handleGet, [Role.MANAGER, Role.ADMIN]))(
        req,
        res
      );
    } else if (req.method === "POST") {
      return await validateForm(handlePost, createUserSchema)(req, res);
    }

    return res.status(405).end();
  } catch (error) {
    return res.status(400).json({ message: `Something went wrong: ${error}` });
  }
};

// GET
const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const loggedUser = req.user as User;

  const whereQuery = isManagerUser(loggedUser)
    ? {
        OR: [
          {
            id: loggedUser.id,
          },
          {
            role: Role.REGULAR,
          },
        ],
      }
    : {};

  const users = await prismadb.user.findMany({
    where: whereQuery,
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
    },
  });

  return res.status(200).json({ users });
};

// POST
const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { username, name, password, role } = req.body;

  const existingUser = await prismadb.user.findUnique({
    where: {
      username,
    },
  });

  if (existingUser) {
    return res.status(409).json({ message: "Username taken" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const dataQuery: Prisma.UserCreateInput = {
    username,
    name,
    password: hashedPassword,
  };

  const loggedUser = await getLoggedUser(req, res);
  if (loggedUser) {
    if (loggedUser.role === Role.ADMIN) {
      dataQuery.role = role;
    }
  } else {
    if (role && role !== Role.REGULAR) {
      return res
        .status(403)
        .json({ message: "Invalid Role. Can only be 'REGULAR'." });
    }
  }

  const user = await prismadb.user.create({
    data: dataQuery,
  });

  return res.status(201).json(user);
};

export default handler;
