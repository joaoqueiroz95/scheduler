import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const getLoggedUser = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<Session["user"] | undefined> => {
  const session = await getServerSession(req, res, authOptions);
  return session?.user;
};
