import { auth } from "@clerk/nextjs/server";

import getClient from "@/lib/prisma/get-client";

const prisma = getClient();

export default async function syncAccount() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error("Cannot sync account: there is no Clerk user ID");
  }

  return prisma.account.upsert({
    create: { clerkUserId },
    update: {},
    where: { clerkUserId },
  });
}
