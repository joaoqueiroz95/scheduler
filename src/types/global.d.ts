import { PrismaClient } from "@prisma/client";
import { Session } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

declare global {
  namespace globalThis {
    var prismadb: PrismaClient;
  }
}
