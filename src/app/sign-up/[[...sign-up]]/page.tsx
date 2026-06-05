import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

import ThemeToggle from "@/app/_components/theme-toggle";
import getAuthRedirectUrl from "@/app/_lib/get-auth-redirect-url";

type SignUpPageProps = {
  searchParams?: Promise<{
    redirect_url?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const redirectUrl = params?.redirect_url;
  const signInUrl = redirectUrl
    ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/sign-in";
  const forceRedirectUrl = getAuthRedirectUrl(redirectUrl);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-sm font-semibold text-foreground" href="/">
            Home
          </Link>
          <nav className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
              href="/sign-in"
            >
              Sign in
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
              href="/sign-up"
            >
              Sign up
            </Link>
          </nav>
        </header>

        <section className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-md border rounded-md p-4 sm:p-6">
            <SignUp
              appearance={{
                elements: {
                  card: "border-0 bg-transparent p-0 shadow-none",
                  footer: "bg-transparent",
                  formButtonPrimary: "shadow-none",
                  formFieldInput: "shadow-none",
                  header: "hidden",
                  socialButtonsBlockButton: "shadow-none",
                },
              }}
              forceRedirectUrl={forceRedirectUrl}
              signInUrl={signInUrl}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
