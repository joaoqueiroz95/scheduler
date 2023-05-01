import { PrismaClient } from "@prisma/client";

const client = global.prismadb || new PrismaClient();
global.prismadb = client;

export default client;
