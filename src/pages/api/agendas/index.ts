import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/libs/prismadb";
import { Prisma, Role, User } from "@prisma/client";
import { checkAuth } from "@/middlewares/auth";
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
  const loggedUser = req.user as User;
  const query = req.query.query as string | undefined;

  if (!loggedUser) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  let whereQuery: Prisma.AgendaWhereInput = {};
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

  if (query) {
    let orQuery: any[] = [];
    if (whereQuery.OR) {
      orQuery = Object.values(whereQuery.OR);
    }

    whereQuery.OR = orQuery.concat(
      { name: { contains: query, mode: "insensitive" } },
      { owner: { name: { contains: query, mode: "insensitive" } } }
    );
  }

  const agendas = await prismadb.agenda.findMany({
    where: whereQuery,
    include: {
      owner: {
        select: {
          name: true,
        },
      },
      tasks: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return res.status(200).json({ agendas });
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
      return res.status(404).json({ error: "'userId' does not exist." });
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
