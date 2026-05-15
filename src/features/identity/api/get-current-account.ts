import { auth } from "@clerk/nextjs/server";

import getClient from "@/lib/prisma/get-client";

export default async function getCurrentAccount() {
  const { userId: clerkUserId } = await auth();

  if (clerkUserId) {
    const prisma = getClient();

    return prisma.account.findUnique({
      where: { clerkUserId },
    });
  }
}
