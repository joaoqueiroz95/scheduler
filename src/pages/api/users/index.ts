import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/libs/prismadb";
import { getLoggedUser } from "@/libs/session";
import { Role } from "@prisma/client";
import { checkAuth } from "@/middlewares/auth";
import { checkRoles } from "@/middlewares/permissions";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { user: loggedUser } = req;

    if (!loggedUser) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    if (req.method === "GET") {
      const whereQuery =
        loggedUser.role === Role.MANAGER
          ? {
              role: Role.REGULAR,
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

      res.status(200).json({ users });
    }

    return res.status(405).end();
  } catch (error) {
    return res.status(400).json({ error: `Something went wrong: ${error}` });
  }
};

export default checkAuth(checkRoles(handler, [Role.MANAGER, Role.ADMIN]));
