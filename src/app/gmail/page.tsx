import Link from "next/link";

import AuthNav, { AuthHeroActions } from "@/app/_components/auth-nav";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-sm font-semibold" href="/">
            ScndCom
          </Link>

          <AuthNav />
        </header>

        <section className="flex flex-1 flex-col justify-center gap-8 py-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Draft emails with your Gmail account
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Sign in with Google to compose and save drafts directly in Gmail.
            </p>
          </div>

          <AuthHeroActions />
        </section>
      </div>
    </main>
  );
}
