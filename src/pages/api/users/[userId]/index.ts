import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/libs/prismadb";
import bcrypt from "bcrypt";
import { Role, User } from "@prisma/client";
import { checkAuth } from "@/middlewares/auth";
import { checkRoles } from "@/middlewares/permissions";
import { isManagerUser } from "@/libs/role";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "DELETE") {
      return await checkAuth(checkRoles(handleDelete, [Role.ADMIN]))(req, res);
    }

    return res.status(405).end();
  } catch (error) {
    return res.status(400).json({ error: `Something went wrong: ${error}` });
  }
};

// DELETE
const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const loggedUser = req.user as User;
  const userId = req.query.userId as string;

  const user = await prismadb.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return res.status(404).json({ error: "User does not exist." });
  }

  if (user.id === loggedUser.id) {
    return res.status(403).json({ error: "User cannot delete itself." });
  }

  await prismadb.user.delete({
    where: {
      id: userId,
    },
  });

  return res.status(204).end();
};

export default handler;
