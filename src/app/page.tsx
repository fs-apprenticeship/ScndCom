import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import getCurrentAccount from "@/features/identity/api/get-current-account";

export default async function Home() {
  const isSignedIn = (await getCurrentAccount()) != null;

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-sm font-semibold" href="/">
            Next.js Template
          </Link>

          <nav className="flex items-center gap-3">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <>
                <Link
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
                  href="/sign-in"
                >
                  Log in
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

        <section className="flex flex-1 flex-col justify-center gap-8 py-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Starter notes
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              This is the default home page for the template. Replace it after
              setup. You can find this file at{" "}
              <code className="font-mono text-sm text-foreground">
                src/app/page.tsx
              </code>
              .
            </p>
          </div>

          {!isSignedIn ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center rounded-md bg-foreground px-6 py-2.5 text-sm font-medium text-background"
                href="/sign-up"
              >
                Create an account
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-md border px-6 py-2.5 text-sm font-medium"
                href="/sign-in"
              >
                Sign in
              </Link>
            </div>
          ) : null}

          <div className="space-y-6 text-sm">
            <div className="space-y-2">
              <h2 className="font-semibold">Change next</h2>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Replace this page once the app has a real home screen.</li>
                <li>
                  <code className="font-mono text-foreground">README.md</code>{" "}
                  has the setup checklist and starter adoption notes.
                </li>
                <li>
                  Update app title, metadata, and any remaining starter copy.
                </li>
                <li>
                  <code className="font-mono text-foreground">
                    prisma/schema.prisma
                  </code>{" "}
                  and{" "}
                  <code className="font-mono text-foreground">
                    prisma/seed.ts
                  </code>{" "}
                  are usually among the first files you will replace.
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="font-semibold">Files to inspect early</h2>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                <li>
                  <code className="font-mono text-foreground">README.md</code>{" "}
                  has the setup checklist and starter adoption notes.
                </li>
                <li>
                  <code className="font-mono text-foreground">
                    src/proxy.ts
                  </code>{" "}
                  controls route protection.
                </li>
                <li>
                  <code className="font-mono text-foreground">
                    src/app/_lib/get-auth-redirect-url.ts
                  </code>{" "}
                  controls auth redirects.
                </li>
                <li>
                  <code className="font-mono text-foreground">
                    src/app/sign-in/[[...sign-in]]/page.tsx
                  </code>{" "}
                  and{" "}
                  <code className="font-mono text-foreground">
                    src/app/sign-up/[[...sign-up]]/page.tsx
                  </code>{" "}
                  are where auth page defaults live.
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="font-semibold">Starter defaults</h2>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                <li>
                  Clerk routes live at{" "}
                  <code className="font-mono text-foreground">/sign-in</code>{" "}
                  and{" "}
                  <code className="font-mono text-foreground">/sign-up</code>.
                </li>
                <li>OpenAI helpers and Sentry wiring are optional.</li>
                <li>
                  Route protection is enforced in{" "}
                  <code className="font-mono text-foreground">
                    src/proxy.ts
                  </code>
                  .
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
