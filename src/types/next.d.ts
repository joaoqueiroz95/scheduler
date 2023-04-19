import { User } from "@prisma/client";
import { NextApiRequest } from "next";

declare module "next" {
  export interface NextApiRequest {
    user?: User;
  }
}
