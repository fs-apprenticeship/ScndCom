import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccountFactory } from "@/test/factories/account-factory";

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
}));

vi.mock("@clerk/nextjs", () => ({
  UserButton: () => <div>user button</div>,
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth,
}));

import Home from "./page";

describe("Home page", () => {
  beforeEach(() => {
    mockAuth.mockReset();
  });

  it("renders auth calls to action when signed out", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    render(await Home());

    expect(
      screen.getByRole("link", { name: "Create an account" }),
    ).toHaveAttribute("href", "/sign-up");
    expect(screen.queryByText("user button")).not.toBeInTheDocument();
  });

  it("renders a user button instead of auth calls to action when signed in", async () => {
    const account = await AccountFactory.create();

    mockAuth.mockResolvedValue({ userId: account.clerkUserId });

    render(await Home());

    expect(screen.getByText("user button")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Create an account" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Sign in" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Log in" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Sign up" }),
    ).not.toBeInTheDocument();
  });
});
