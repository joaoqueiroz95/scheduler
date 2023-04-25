import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/libs/prismadb";
import { Role, User } from "@prisma/client";
import { checkAuth } from "@/middlewares/auth";
import { isManagerUser, isRegularUser } from "@/libs/role";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "POST") {
      return await checkAuth(handlePost)(req, res);
    }

    return res.status(405).end();
  } catch (error) {
    return res.status(400).json({ error: `Something went wrong: ${error}` });
  }
};

// POST
const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const loggedUser = req.user as User;
  let { name, timezone, ownerId } = req.body;

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
