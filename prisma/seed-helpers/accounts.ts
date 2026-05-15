import { type PrismaClient } from "@/generated/prisma/client";

import { type AccountSeed } from "./types";

export function seedAccounts(
  prisma: PrismaClient,
  seeds: readonly AccountSeed[],
) {
  return Promise.all(
    seeds.map((seed) =>
      prisma.account.upsert({
        create: seed,
        update: seed,
        where: { clerkUserId: seed.clerkUserId },
      }),
    ),
  );
}
