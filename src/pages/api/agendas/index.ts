import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/libs/prismadb";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { checkAuth } from "@/middlewares/auth";
import { checkRoles } from "@/middlewares/permissions";
import { isManagerUser, isRegularUser } from "@/libs/role";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      return await checkAuth(handleGet)(req, res);
    } else if (req.method === "POST") {
      return await checkAuth(handlePost)(req, res);
    }

    return res.status(405).end();
  } catch (error) {
    return res.status(400).json({ error: `Something went wrong: ${error}` });
  }
};

// GET
const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const { user: loggedUser } = req;

  if (!loggedUser) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  let whereQuery = {};
  if (isRegularUser(loggedUser)) {
    whereQuery = {
      ownerId: loggedUser.id,
    };
  } else if (isManagerUser(loggedUser)) {
    whereQuery = {
      OR: [
        {
          ownerId: loggedUser.id,
        },
        {
          owner: {
            role: Role.REGULAR,
          },
        },
      ],
    };
  }

  const agendas = await prismadb.agenda.findMany({
    where: whereQuery,
    include: {
      owner: {
        select: {
          name: true,
        },
      },
    },
  });

  return res.status(200).json({ agendas });
};

// POST
const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { user: loggedUser } = req;
  let { name, timezone, ownerId } = req.body;

  if (!loggedUser) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  if (isRegularUser(loggedUser)) {
    ownerId = loggedUser.id;
  } else {
    const user = await prismadb.user.findUnique({
      where: {
        id: ownerId,
      },
    });

    if (!user) {
      return res
        .status(403)
        .json({ error: "The provided userId does not exist." });
    }

    if (isManagerUser(loggedUser)) {
      if (!isRegularUser(user) && user.id !== loggedUser.id) {
        return res
          .status(403)
          .json({ error: "You can only create agendas for regular users." });
      }
    }
  }

  const newAgenda = await prismadb.agenda.create({
    data: {
      name,
      timezone,
      owner: {
        connect: {
          id: ownerId,
        },
      },
    },
    include: {
      owner: {
        select: {
          name: true,
        },
      },
    },
  });

  return res.status(201).json({ agenda: newAgenda });
};

export default handler;
