import { User } from "@prisma/client";

export interface IGetUsers {
  users: User[];
}
