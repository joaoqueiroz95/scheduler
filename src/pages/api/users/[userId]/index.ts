import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/libs/prismadb";
import { Prisma, Role, User } from "@prisma/client";
import { checkAuth } from "@/middlewares/auth";
import { checkRoles } from "@/middlewares/permissions";
import { isManagerUser, isRegularUser } from "@/libs/role";
import _ from "underscore";
import bcrypt from "bcrypt";
import { editUserSchema } from "@/constants/schemas/user";
import { validateForm } from "@/middlewares/form";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      return await checkAuth(handleGet)(req, res);
    } else if (req.method === "PATCH") {
      return await checkAuth(validateForm(handlePatch, editUserSchema))(
        req,
        res
      );
    } else if (req.method === "DELETE") {
      return await checkAuth(checkRoles(handleDelete, [Role.ADMIN]))(req, res);
    }

    return res.status(405).end();
  } catch (error) {
    return res.status(400).json({ message: `Something went wrong: ${error}` });
  }
};

// GET
const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const loggedUser = req.user as User;
  const userId = req.query.userId as string;

  const user = await prismadb.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User does not exist." });
  }

  if (isRegularUser(loggedUser)) {
    if (user.id !== loggedUser.id) {
      return res
        .status(403)
        .json({ message: "No permission to retrieve user." });
    }
  } else if (isManagerUser(loggedUser)) {
    if (!isRegularUser(user) && user.id !== loggedUser.id) {
      return res
        .status(403)
        .json({ message: "No permission to retrieve user." });
    }
  }

  return res.status(200).json(_.pick(user, "id", "username", "name", "role"));
};

// PATCH
const handlePatch = async (req: NextApiRequest, res: NextApiResponse) => {
  const loggedUser = req.user as User;
  const userId = req.query.userId as string;
  const { name, username, password, role } = req.body;

  const user = await prismadb.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User does not exist." });
  }

  if (isRegularUser(loggedUser)) {
    if (user.id !== loggedUser.id) {
      return res.status(403).json({ message: "User can only edit itself." });
    }

    if (role && role !== Role.REGULAR) {
      return res.status(403).json({ message: "User cannot promote itself." });
    }
  } else if (isManagerUser(loggedUser)) {
    if (!isRegularUser(user) && user.id !== loggedUser.id) {
      return res.status(403).json({ message: "No permission to edit user." });
    }

    if (role === Role.ADMIN) {
      return res
        .status(403)
        .json({ message: "No permission to promote to Admin." });
    }

    if (role === Role.REGULAR && user.id === loggedUser.id) {
      return res.status(403).json({ message: "User cannot demote itself." });
    }
  } else {
    if (role !== Role.ADMIN && user.id === loggedUser.id) {
      return res.status(403).json({ message: "User cannot demote itself." });
    }
  }

  const dataQuery: Prisma.UserUpdateInput = {};
  if (name) {
    dataQuery.name = name;
  }
  if (username) {
    dataQuery.username = username;
  }
  if (role) {
    dataQuery.role = role;
  }
  if (password) {
    dataQuery.password = await bcrypt.hash(password, 12);
  }

  const editedUser = await prismadb.user.update({
    where: {
      id: user.id,
    },
    data: dataQuery,
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
    },
  });

  return res.status(200).json(editedUser);
};

// DELETE
const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const loggedUser = req.user as User;
  const userId = req.query.userId as string;

  const user = await prismadb.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User does not exist." });
  }

  if (user.id === loggedUser.id) {
    return res.status(403).json({ message: "User cannot delete itself." });
  }

  await prismadb.user.delete({
    where: {
      id: userId,
    },
  });

  return res.status(204).end();
};

export default handler;
