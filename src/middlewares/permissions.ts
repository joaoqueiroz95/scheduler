import { Role } from "@prisma/client";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export const checkRoles =
  (handler: NextApiHandler, roles: Role[]) =>
  (req: NextApiRequest, res: NextApiResponse) => {
    const { user: loggedUser } = req;

    if (!loggedUser?.role) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    if (!roles.includes(loggedUser.role)) {
      return res
        .status(403)
        .json({ message: "User cannot access this resource" });
    }

    handler(req, res);
  };
