import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccountFactory } from "@/test/factories/account-factory";

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth,
}));

import syncAccount from "./sync-account";

describe("syncAccount", () => {
  beforeEach(() => {
    mockAuth.mockReset();
  });

  it("creates an account for the current Clerk user", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });

    const result = await syncAccount();

    expect(result).toMatchObject({
      clerkUserId: "user_123",
    });
    expect(result?.id).toBeTruthy();
  });

  it("returns the existing account when called again for the current Clerk user", async () => {
    const existingAccount = await AccountFactory.create({
      clerkUserId: "user_123",
    });
    mockAuth.mockResolvedValue({ userId: existingAccount.clerkUserId });

    const result = await syncAccount();

    expect(result).toMatchObject(existingAccount);
  });

  it("throws when there is no current Clerk user id", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    await expect(syncAccount()).rejects.toThrow(
      "Cannot sync account: there is no Clerk user ID",
    );
  });
});
