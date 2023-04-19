import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/libs/prismadb";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { checkAuth } from "@/middlewares/auth";
import { checkRoles } from "@/middlewares/permissions";
import { isManagerUser, isRegularUser } from "@/libs/role";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "POST") {
      return await checkAuth(
        checkRoles(handlePost, [Role.MANAGER, Role.ADMIN])
      )(req, res);
    }

    return res.status(405).end();
  } catch (error) {
    return res.status(400).json({ error: `Something went wrong: ${error}` });
  }
};

// POST
const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = req.query.userId as string;
  const agendaId = req.body.agendaId as string;

  const { user: loggedUser } = req;

  if (!loggedUser) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  if (isManagerUser(loggedUser)) {
    if (userId !== loggedUser.id) {
      return res.status(403).json({
        message:
          "Invalid userId. User of role Manager can only use their own id.",
      });
    }
  }

  const user = await prismadb.user.findUnique({
    where: { id: userId },
  });

  const agenda = await prismadb.agenda.findUnique({
    where: { id: agendaId },
    include: { owner: true },
  });

  if (!user || !agenda) {
    return res.status(404).json({ message: "User or agenda not found" });
  }

  if (isManagerUser(loggedUser)) {
    if (!isRegularUser(agenda.owner)) {
      return res.status(403).json({
        message: "Agenda must belong to a regular user.",
      });
    }
  }

  const updatedUser = await prismadb.user.update({
    where: { id: userId },
    data: { addedAgendas: { connect: { id: agendaId } } },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      addedAgendas: true,
    },
  });

  return res.status(201).json({ user: updatedUser });
};

export default handler;
