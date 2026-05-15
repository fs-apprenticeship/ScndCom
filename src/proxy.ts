import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/auth/sync(.*)",
]);

export default clerkMiddleware(async (auth, request): Promise<void> => {
  if (isPublicRoute(request)) return;

  const signInUrl = new URL("/sign-in", request.url);
  const redirectUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (redirectUrl !== "/") {
    signInUrl.searchParams.set("redirect_url", redirectUrl);
  }

  await auth.protect({ unauthenticatedUrl: signInUrl.toString() });
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
