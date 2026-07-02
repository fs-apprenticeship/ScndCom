import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUseSignIn } = vi.hoisted(() => ({
  mockUseSignIn: vi.fn(),
}));

vi.mock("@clerk/nextjs", () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="signed-in">{children}</div>
  ),
  SignedOut: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="signed-out">{children}</div>
  ),
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SignUpButton: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  UserButton: () => <div>user button</div>,
  useSignIn: mockUseSignIn,
}));

import Home from "./page";

describe("Home page", () => {
  beforeEach(() => {
    mockUseSignIn.mockReturnValue({
      isLoaded: true,
      signIn: {
        authenticateWithRedirect: vi.fn(),
      },
    });
  });

  it("renders sign-in controls when signed out", () => {
    render(<Home />);

    expect(screen.getByTestId("signed-out")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sign in with email")).toBeInTheDocument();
    expect(screen.getByText("Log in")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("renders signed-in controls", () => {
    render(<Home />);

    expect(screen.getByTestId("signed-in")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Compose" })).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: "Create a new draft" }),
    ).toHaveAttribute("href", "/compose");
    expect(screen.getByText("user button")).toBeInTheDocument();
  });
});
