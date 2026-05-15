import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccountFactory } from "@/test/factories/account-factory";

const { auth } = vi.hoisted(() => ({
  auth: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth,
}));

import getCurrentAccount from "./get-current-account";

describe("getCurrentAccount", () => {
  beforeEach(() => {
    auth.mockReset();
  });

  it("returns the account for the given Clerk user id", async () => {
    const account = await AccountFactory.create();

    auth.mockResolvedValue({ userId: account.clerkUserId });

    const found = await getCurrentAccount();

    expect(found).toMatchObject({
      clerkUserId: account.clerkUserId,
      id: account.id,
    });
  });

  it("returns null when no account exists for the Clerk user id", async () => {
    auth.mockResolvedValue({ userId: "user_123" });

    const found = await getCurrentAccount();

    expect(found).toBeNull();
  });

  it("returns undefined when there is no current Clerk user id", async () => {
    auth.mockResolvedValueOnce({ userId: null });

    const found = await getCurrentAccount();

    expect(found).toBeUndefined();
  });
});
