import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccountFactory } from "@/test/factories/account-factory";

const { auth } = vi.hoisted(() => ({
  auth: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth,
}));

import requireCurrentAccount from "./require-current-account";

describe("requireCurrentAccount", () => {
  beforeEach(() => {
    auth.mockReset();
  });

  it("returns the account for the current Clerk ID", async () => {
    const account = await AccountFactory.create();

    auth.mockResolvedValue({ userId: account.clerkUserId });

    await expect(requireCurrentAccount()).resolves.toEqual(account);
  });

  it("throws if there is no account matching the current Clerk ID", async () => {
    auth.mockResolvedValue({ userId: "user_123" });

    await expect(requireCurrentAccount()).rejects.toThrow();
  });

  it("throws if there is no current Clerk ID", async () => {
    auth.mockResolvedValueOnce({ userId: null });

    await expect(requireCurrentAccount()).rejects.toThrow(
      "Unable to get account; current clerkUserId is null",
    );
  });
});
