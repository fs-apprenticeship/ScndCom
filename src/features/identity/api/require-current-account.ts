import { auth } from "@clerk/nextjs/server";

import getClient from "@/lib/prisma/get-client";

const prisma = getClient();

export default async function requireCurrentAccount() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw Error("Unable to get account; current clerkUserId is null");
  }

  return prisma.account.findUniqueOrThrow({
    where: { clerkUserId },
  });
}
