import { getLoggedUser } from "@/libs/session";
import { Role } from "@prisma/client";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/libs/prismadb";

export const checkAuth =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const loggedUser = await getLoggedUser(req, res);

    if (!loggedUser?.username) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    try {
      const user = await prismadb.user.findUnique({
        where: { username: loggedUser.username },
      });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;

      handler(req, res);
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Error retrieving user information" });
    }
  };
