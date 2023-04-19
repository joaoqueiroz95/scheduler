import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/libs/prismadb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = req.query.userId as string;

  if (req.method === "GET") {
    const user = await prismadb.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
      },
    });

    res.status(200).json({ id: user?.id });
  }

  return res.status(405).end();
}
