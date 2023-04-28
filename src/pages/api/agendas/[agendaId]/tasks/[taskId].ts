import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/libs/prismadb";
import { User } from "@prisma/client";
import { checkAuth } from "@/middlewares/auth";
import { isManagerUser, isRegularUser } from "@/libs/role";
import { editTaskSchema } from "@/constants/schemas/task";
import { validateForm } from "@/middlewares/form";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "PATCH") {
      return await checkAuth(validateForm(handlePatch, editTaskSchema))(
        req,
        res
      );
    } else if (req.method === "DELETE") {
      return await checkAuth(handleDelete)(req, res);
    }

    return res.status(405).end();
  } catch (error) {
    return res.status(400).json({ message: `Something went wrong: ${error}` });
  }
};

// PATCH
const handlePatch = async (req: NextApiRequest, res: NextApiResponse) => {
  const loggedUser = req.user as User;
  const agendaId = req.query.agendaId as string;
  const taskId = req.query.taskId as string;
  const { name } = req.body;

  const agenda = await prismadb.agenda.findUnique({
    where: {
      id: agendaId,
    },
    include: {
      tasks: {
        select: {
          id: true,
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

  const taskExistsInAgenda = Boolean(
    agenda.tasks.find((task) => task.id === taskId)
  );
  if (!taskExistsInAgenda) {
    return res
      .status(404)
      .json({ message: "Task does not exist in the agenda." });
  }

  const editedTask = await prismadb.task.update({
    where: {
      id: taskId,
    },
    data: {
      name,
    },
  });

  return res.status(200).json(editedTask);
};

// DELETE
const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const loggedUser = req.user as User;
  const agendaId = req.query.agendaId as string;
  const taskId = req.query.taskId as string;

  const agenda = await prismadb.agenda.findUnique({
    where: {
      id: agendaId,
    },
    include: {
      tasks: {
        select: {
          id: true,
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

  const taskExistsInAgenda = Boolean(
    agenda.tasks.find((task) => task.id === taskId)
  );
  if (!taskExistsInAgenda) {
    return res
      .status(404)
      .json({ message: "Task does not exist in the agenda." });
  }

  await prismadb.task.delete({
    where: {
      id: taskId,
    },
  });

  return res.status(204).end();
};

export default handler;
