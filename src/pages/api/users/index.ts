import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/libs/prismadb";
import bcrypt from "bcrypt";
import { Role, User } from "@prisma/client";
import { checkAuth } from "@/middlewares/auth";
import { checkRoles } from "@/middlewares/permissions";
import { isManagerUser } from "@/libs/role";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      return await checkAuth(checkRoles(handleGet, [Role.MANAGER, Role.ADMIN]))(
        req,
        res
      );
    } else if (req.method === "POST") {
      return await handlePost(req, res);
    }

    return res.status(405).end();
  } catch (error) {
    return res.status(400).json({ error: `Something went wrong: ${error}` });
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
  const { username, name, password } = req.body;

  const existingUser = await prismadb.user.findUnique({
    where: {
      username,
    },
  });

  if (existingUser) {
    return res.status(422).json({ error: "Username taken" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prismadb.user.create({
    data: {
      username,
      name,
      password: hashedPassword,
    },
  });

  return res.status(201).json(user);
};

export default handler;
