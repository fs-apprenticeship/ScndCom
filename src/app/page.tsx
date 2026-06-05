import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import ThemeToggle from "@/app/_components/theme-toggle";
import getCurrentAccount from "@/features/identity/api/get-current-account";

export default async function Home() {
  const isSignedIn = (await getCurrentAccount()) != null;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-sm font-semibold text-foreground" href="/">
            Home
          </Link>
          <nav className="flex items-center gap-3">
            <ThemeToggle />
            {isSignedIn ? (
              <UserButton />
            ) : (
              <>
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
              </>
            )}
          </nav>
        </header>

        <section className="flex flex-1 items-center justify-center py-12">
          <div className="flex gap-4">
            <Link
              className="inline-flex items-center justify-center rounded-md border px-6 py-2.5 text-sm font-medium"
              href="/test"
            >
              Test
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-md border px-6 py-2.5 text-sm font-medium"
              href="/notes"
            >
              Notes
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
