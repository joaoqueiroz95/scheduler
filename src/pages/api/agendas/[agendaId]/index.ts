import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/libs/prismadb";
import { Role, User } from "@prisma/client";
import { checkAuth } from "@/middlewares/auth";
import { isManagerUser, isRegularUser } from "@/libs/role";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      return await checkAuth(handleGet)(req, res);
    }

    return res.status(405).end();
  } catch (error) {
    return res.status(400).json({ error: `Something went wrong: ${error}` });
  }
};

// GET
const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const loggedUser = req.user as User;
  const agendaId = req.query.agendaId as string;

  const agenda = await prismadb.agenda.findUnique({
    where: {
      id: agendaId,
    },
    include: {
      tasks: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!agenda) {
    return res.status(404).json({ error: "'agendaId' does not exist." });
  }

  if (isRegularUser(loggedUser)) {
    if (agenda.ownerId !== loggedUser.id) {
      return res.status(403).json({ error: "User cannot access this agenda." });
    }
  } else {
    const user = await prismadb.user.findUnique({
      where: {
        id: agenda.ownerId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Invalid agenda." });
    }

    if (isManagerUser(loggedUser)) {
      if (!isRegularUser(user) && user.id !== loggedUser.id) {
        return res
          .status(403)
          .json({ error: "User cannot access this agenda." });
      }
    }
  }

  return res.status(200).json(agenda);
};

export default handler;
