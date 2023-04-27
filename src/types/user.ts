import { Role, User } from "@prisma/client";

export interface IGetUsers {
  users: User[];
}

export interface IUser {
  id: string;
  name: string;
  username: string;
  role: Role;
}
