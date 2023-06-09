import { getLoggedUser } from "@/libs/session";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/libs/prismadb";

export const checkAuth =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const loggedUser = await getLoggedUser(req, res);

    if (!loggedUser?.id) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    try {
      const user = await prismadb.user.findUnique({
        where: { id: loggedUser.id },
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
