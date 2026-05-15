import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { appProviderMock } = vi.hoisted(() => ({
  appProviderMock: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-provider">{children}</div>
  )),
}));

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
  Geist_Mono: () => ({ variable: "font-geist-mono" }),
}));

vi.mock("@/app/provider", () => ({
  default: appProviderMock,
}));

import RootLayout from "./layout";

describe("RootLayout", () => {
  afterEach(() => {
    appProviderMock.mockClear();
  });

  it("renders the neutral app shell inside the provider", () => {
    const layout = RootLayout({
      children: <div>Page content</div>,
    });

    render(layout);

    expect(screen.getByTestId("app-provider")).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
    expect(appProviderMock).toHaveBeenCalledOnce();
  });
});
