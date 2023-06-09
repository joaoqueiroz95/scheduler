import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/libs/prismadb";
import { User } from "@prisma/client";
import { checkAuth } from "@/middlewares/auth";
import { isManagerUser, isRegularUser } from "@/libs/role";
import { validateForm } from "@/middlewares/form";
import { editAgendaSchema } from "@/constants/schemas/agenda";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      return await checkAuth(handleGet)(req, res);
    } else if (req.method === "PATCH") {
      return await checkAuth(validateForm(handlePatch, editAgendaSchema))(
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
    return res.status(404).json({ message: "agenda does not exist." });
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

  return res.status(200).json(agenda);
};

// PATCH
const handlePatch = async (req: NextApiRequest, res: NextApiResponse) => {
  const loggedUser = req.user as User;
  const agendaId = req.query.agendaId as string;
  const { name, ownerId, timezone } = req.body;

  const agenda = await prismadb.agenda.findUnique({
    where: {
      id: agendaId,
    },
  });

  if (!agenda) {
    return res.status(404).json({ message: "agenda does not exist." });
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

  const dataQuery: any = {};
  if (name) {
    dataQuery.name = name;
  }
  if (timezone) {
    dataQuery.timezone = timezone;
  }
  if (ownerId) {
    dataQuery.owner = {
      connect: {
        id: ownerId,
      },
    };
  }

  const editedAgenda = await prismadb.agenda.update({
    where: {
      id: agendaId,
    },
    data: dataQuery,
  });

  return res.status(200).json(editedAgenda);
};

// DELETE
const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const loggedUser = req.user as User;
  const agendaId = req.query.agendaId as string;

  const agenda = await prismadb.agenda.findUnique({
    where: {
      id: agendaId,
    },
  });

  if (!agenda) {
    return res.status(404).json({ message: "agenda does not exist." });
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

  await prismadb.agenda.delete({
    where: {
      id: agendaId,
    },
  });

  return res.status(204).end();
};

export default handler;
