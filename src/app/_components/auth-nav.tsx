"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

import GoogleSignInButton from "@/app/_components/google-sign-in-button";
import getAuthRedirectUrl from "@/app/_lib/get-auth-redirect-url";

export function AuthHeroActions() {
  const forceRedirectUrl = getAuthRedirectUrl();

  return (
    <>
      <SignedOut>
        <div className="flex flex-col gap-3 sm:flex-row">
          <GoogleSignInButton className="inline-flex items-center justify-center rounded-md bg-foreground px-6 py-2.5 text-sm font-medium text-background" />
          <SignInButton forceRedirectUrl={forceRedirectUrl} mode="redirect">
            <span className="inline-flex items-center justify-center rounded-md border px-6 py-2.5 text-sm font-medium">
              Sign in with email
            </span>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <Link
          className="inline-flex items-center justify-center rounded-md bg-foreground px-6 py-2.5 text-sm font-medium text-background"
          href="/compose"
        >
          Create a new draft
        </Link>
      </SignedIn>
    </>
  );
}

export default function AuthNav() {
  const forceRedirectUrl = getAuthRedirectUrl();

  return (
    <nav className="flex items-center gap-3">
      <SignedIn>
        <Link
          className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
          href="/compose"
        >
          Compose
        </Link>
        <UserButton />
      </SignedIn>

      <SignedOut>
        <SignInButton forceRedirectUrl={forceRedirectUrl} mode="redirect">
          <span className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium">
            Log in
          </span>
        </SignInButton>
        <SignUpButton forceRedirectUrl={forceRedirectUrl} mode="redirect">
          <span className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">
            Sign up
          </span>
        </SignUpButton>
      </SignedOut>
    </nav>
  );
}
