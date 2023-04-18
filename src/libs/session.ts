import { NextApiRequest } from "next";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";

export const getLoggedUser = async (
  req: NextApiRequest
): Promise<Session["user"] | undefined> => {
  const session = await getSession({ req });
  return session?.user;
};
