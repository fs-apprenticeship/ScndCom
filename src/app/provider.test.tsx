import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { mockClerkProvider } = vi.hoisted(() => ({
  mockClerkProvider: vi.fn(
    ({
      children,
      signInForceRedirectUrl,
      signUpForceRedirectUrl,
    }: {
      children: React.ReactNode;
      signInForceRedirectUrl?: string;
      signUpForceRedirectUrl?: string;
    }) => (
      <div>
        <span>{signInForceRedirectUrl}</span>
        <span>{signUpForceRedirectUrl}</span>
        {children}
      </div>
    ),
  ),
}));

vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: mockClerkProvider,
}));

import AppProvider from "./provider";

describe("AppProvider", () => {
  it("sends every Clerk auth flow through account sync first", () => {
    render(
      <AppProvider>
        <p>child</p>
      </AppProvider>,
    );

    expect(mockClerkProvider).toHaveBeenCalledOnce();
    expect(screen.getAllByText("/api/auth/sync")).toHaveLength(2);
    expect(screen.getByText("child")).toBeInTheDocument();
  });
});
