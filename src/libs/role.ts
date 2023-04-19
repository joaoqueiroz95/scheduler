import { Role, User } from "@prisma/client";

export const isRegularUser = (user: User) => user.role === Role.REGULAR;
export const isManagerUser = (user: User) => user.role === Role.MANAGER;
export const isAdminUser = (user: User) => user.role === Role.ADMIN;
