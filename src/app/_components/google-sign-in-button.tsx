"use client";

import { useSignIn } from "@clerk/nextjs";
import { useCallback, useState } from "react";

import getAuthRedirectUrl from "@/app/_lib/get-auth-redirect-url";

type GoogleSignInButtonProps = {
  className?: string;
  redirectUrl?: string;
};

export default function GoogleSignInButton({
  className,
  redirectUrl,
}: GoogleSignInButtonProps) {
  const { isLoaded, signIn } = useSignIn();
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = useCallback(async () => {
    if (!isLoaded || !signIn) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signIn.authenticateWithRedirect({
        redirectUrl: "/sign-in/sso-callback",
        redirectUrlComplete: getAuthRedirectUrl(redirectUrl),
        strategy: "oauth_google",
      });
    } catch {
      setErrorMessage("Unable to start Google sign in. Try again.");
      setIsSubmitting(false);
    }
  }, [isLoaded, redirectUrl, signIn]);

  return (
    <div className="space-y-2">
      <button
        className={
          className ??
          "inline-flex items-center justify-center rounded-md border px-6 py-2.5 text-sm font-medium"
        }
        disabled={!isLoaded || isSubmitting}
        onClick={handleClick}
        type="button"
      >
        {isSubmitting ? "Redirecting..." : "Continue with Google"}
      </button>

      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
