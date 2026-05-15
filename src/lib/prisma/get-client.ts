import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/*
 * NOTE: the logic below prevents multiple instances of the Prisma client in
 * development; see https://www.prisma.io/docs/orm/more/troubleshooting/nextjs#avoid-multiple-prisma-client-instances
 */

declare global {
  var prisma: PrismaClient | undefined;
}

export default function getClient() {
  if (global.prisma) return global.prisma;

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
  }

  return prisma;
}
