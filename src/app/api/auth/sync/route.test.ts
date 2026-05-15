import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockSyncAccount } = vi.hoisted(() => ({
  mockSyncAccount: vi.fn(),
}));

vi.mock("@/features/identity/api/sync-account", () => ({
  default: mockSyncAccount,
}));

import { GET } from "./route";

describe("auth sync route", () => {
  beforeEach(() => {
    mockSyncAccount.mockReset();
    mockSyncAccount.mockResolvedValue(undefined);
  });

  it("ensures an account exists and redirects home", async () => {
    const request = new Request("https://example.com/api/auth/sync");

    const response = await GET(request);

    expect(mockSyncAccount).toHaveBeenCalledOnce();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.com/");
  });

  it("redirects to the original protected page when redirect_url is present", async () => {
    const request = new Request(
      "https://example.com/api/auth/sync?redirect_url=%2Fworkspace%3Ftab%3Dsettings",
    );

    const response = await GET(request);

    expect(mockSyncAccount).toHaveBeenCalledOnce();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.com/workspace?tab=settings",
    );
  });

  it("allows same-origin absolute redirect urls", async () => {
    const request = new Request(
      "https://example.com/api/auth/sync?redirect_url=https%3A%2F%2Fexample.com%2Fworkspace",
    );

    const response = await GET(request);

    expect(mockSyncAccount).toHaveBeenCalledOnce();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.com/workspace",
    );
  });

  it("redirects home when the identity action returns nothing", async () => {
    const request = new Request("https://example.com/api/auth/sync");

    const response = await GET(request);

    expect(mockSyncAccount).toHaveBeenCalledOnce();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.com/");
  });

  it("ignores unsafe redirect urls", async () => {
    const request = new Request(
      "https://example.com/api/auth/sync?redirect_url=https://malicious.example.com/phish",
    );

    const response = await GET(request);

    expect(mockSyncAccount).toHaveBeenCalledOnce();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.com/");
  });
});
