import { type PrismaClient } from "@/generated/prisma/client";

export type AccountSeed = {
  clerkUserId: string;
};

export type Fixture = {
  accounts?: readonly AccountSeed[];
  afterSeed?: (prisma: PrismaClient) => Promise<void>;
};
