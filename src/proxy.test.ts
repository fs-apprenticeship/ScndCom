import { describe, expect, it, vi } from "vitest";

const {
  callbackStore,
  clerkMiddlewareMock,
  createRouteMatcherMock,
  isProtectedRouteMock,
} = vi.hoisted(() => {
  const callbackStore: {
    callback?: (
      auth: {
        protect: (options?: {
          unauthenticatedUrl?: string;
        }) => Promise<Response | void>;
      },
      request: unknown,
    ) => Promise<Response | void>;
  } = {};

  const isProtectedRouteMock = vi.fn<(request: unknown) => boolean>();
  const createRouteMatcherMock = vi.fn(() => isProtectedRouteMock);
  const clerkMiddlewareMock = vi.fn((callback) => {
    callbackStore.callback = callback;
    return "mock-clerk-middleware";
  });

  return {
    callbackStore,
    clerkMiddlewareMock,
    createRouteMatcherMock,
    isProtectedRouteMock,
  };
});

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: clerkMiddlewareMock,
  createRouteMatcher: createRouteMatcherMock,
}));

import middleware from "./proxy";

describe("proxy middleware", () => {
  const requestUrl = "https://example.com/workspace";
  const request = {
    nextUrl: {
      pathname: "/workspace",
      search: "",
    },
    url: requestUrl,
  };

  it("builds middleware with the public route matcher", () => {
    expect(middleware).toBe("mock-clerk-middleware");
    expect(createRouteMatcherMock).toHaveBeenCalledWith([
      "/",
      "/sign-in(.*)",
      "/sign-up(.*)",
      "/api/auth/sync(.*)",
    ]);
    expect(clerkMiddlewareMock).toHaveBeenCalledTimes(1);
  });

  it("protects requests that do not match public routes", async () => {
    const protect = vi.fn(() => Promise.resolve());
    isProtectedRouteMock.mockReturnValue(false);

    await callbackStore.callback?.({ protect }, request);

    expect(protect).toHaveBeenCalledTimes(1);
    expect(protect).toHaveBeenCalledWith({
      unauthenticatedUrl:
        "https://example.com/sign-in?redirect_url=%2Fworkspace",
    });
  });

  it("delegates unauthenticated redirect behavior to auth.protect", async () => {
    const redirectResponse = new Response(null, {
      headers: { location: "/sign-in" },
      status: 307,
    });
    const protect = vi.fn(() => Promise.resolve(redirectResponse));
    isProtectedRouteMock.mockReturnValue(false);

    await callbackStore.callback?.({ protect }, request);

    expect(protect).toHaveBeenCalledTimes(1);
    expect(protect).toHaveBeenCalledWith({
      unauthenticatedUrl:
        "https://example.com/sign-in?redirect_url=%2Fworkspace",
    });
    await expect(protect.mock.results[0]?.value).resolves.toBe(
      redirectResponse,
    );
    await expect(protect.mock.results[0]?.value).resolves.toMatchObject({
      status: 307,
    });
  });

  it("does not protect requests that match public routes", async () => {
    const protect = vi.fn(() => Promise.resolve());
    isProtectedRouteMock.mockReturnValue(true);

    await callbackStore.callback?.(
      { protect },
      {
        ...request,
        nextUrl: {
          pathname: "/sign-in",
          search: "",
        },
        url: "https://example.com/sign-in",
      },
    );

    expect(protect).not.toHaveBeenCalled();
  });

  it("preserves the protected route query string in the redirect url", async () => {
    const protect = vi.fn(() => Promise.resolve());
    isProtectedRouteMock.mockReturnValue(false);

    await callbackStore.callback?.(
      {
        protect,
      },
      {
        ...request,
        nextUrl: {
          pathname: "/workspace",
          search: "?tab=settings",
        },
        url: "https://example.com/workspace?tab=settings",
      },
    );

    expect(protect).toHaveBeenCalledWith({
      unauthenticatedUrl:
        "https://example.com/sign-in?redirect_url=%2Fworkspace%3Ftab%3Dsettings",
    });
  });

  it("preserves the requested protected path in the unauthenticated redirect url", async () => {
    const protect = vi.fn(() => Promise.resolve());
    isProtectedRouteMock.mockReturnValue(false);

    await callbackStore.callback?.(
      { protect },
      {
        ...request,
        nextUrl: {
          pathname: "/workspace/settings/profile",
          search: "",
        },
        url: "https://example.com/workspace/settings/profile",
      },
    );

    expect(protect).toHaveBeenCalledWith({
      unauthenticatedUrl:
        "https://example.com/sign-in?redirect_url=%2Fworkspace%2Fsettings%2Fprofile",
    });
  });

  it("does not include redirect_url when the unauthenticated request is for root", async () => {
    const protect = vi.fn(() => Promise.resolve());
    isProtectedRouteMock.mockReturnValue(true);

    await callbackStore.callback?.(
      { protect },
      {
        ...request,
        nextUrl: {
          pathname: "/",
          search: "",
        },
        url: "https://example.com/",
      },
    );

    expect(protect).not.toHaveBeenCalled();
  });

  it("does not protect the sign-up route", async () => {
    const protect = vi.fn(() => Promise.resolve());
    isProtectedRouteMock.mockReturnValue(true);

    await callbackStore.callback?.(
      { protect },
      {
        ...request,
        nextUrl: {
          pathname: "/sign-up",
          search: "",
        },
        url: "https://example.com/sign-up",
      },
    );

    expect(protect).not.toHaveBeenCalled();
  });

  it("does not protect the auth sync route", async () => {
    const protect = vi.fn(() => Promise.resolve());
    isProtectedRouteMock.mockReturnValue(true);

    await callbackStore.callback?.(
      { protect },
      {
        ...request,
        nextUrl: {
          pathname: "/api/auth/sync",
          search: "",
        },
        url: "https://example.com/api/auth/sync",
      },
    );

    expect(protect).not.toHaveBeenCalled();
  });
});
