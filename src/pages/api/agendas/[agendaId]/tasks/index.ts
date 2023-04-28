import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/libs/prismadb";
import { User } from "@prisma/client";
import { checkAuth } from "@/middlewares/auth";
import { isManagerUser, isRegularUser } from "@/libs/role";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "POST") {
      return await checkAuth(handlePost)(req, res);
    }

    return res.status(405).end();
  } catch (error) {
    return res.status(400).json({ message: `Something went wrong: ${error}` });
  }
};

// POST
const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const loggedUser = req.user as User;
  const agendaId = req.query.agendaId as string;
  let { name } = req.body;

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
    return res.status(404).json({ message: "'agendaId' does not exist." });
  }

  if (isRegularUser(loggedUser)) {
    if (agenda.ownerId !== loggedUser.id) {
      return res
        .status(403)
        .json({ message: "User cannot access this agenda." });
    }
  } else {
    const user = await prismadb.user.findUnique({
      where: {
        id: agenda.ownerId,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid agenda." });
    }

    if (isManagerUser(loggedUser)) {
      if (!isRegularUser(user) && user.id !== loggedUser.id) {
        return res
          .status(403)
          .json({ message: "User cannot access this agenda." });
      }
    }
  }

  const newTask = await prismadb.task.create({
    data: {
      name,
      agenda: {
        connect: {
          id: agendaId,
        },
      },
    },
  });

  return res.status(201).json({ task: newTask });
};

export default handler;
