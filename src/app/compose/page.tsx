import Link from "next/link";

import AuthNav from "@/app/_components/auth-nav";
import ComposeDraftForm from "@/app/compose/compose-draft-form";

export default function ComposePage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-sm font-semibold" href="/">
            ScndCom
          </Link>

          <AuthNav />
        </header>

        <section className="flex flex-1 flex-col gap-6 py-12">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Compose email
            </h1>
            <p className="text-sm text-muted-foreground">
              Signed in with Google. Send email directly or save a draft to your
              Gmail account.
            </p>
          </div>

          <ComposeDraftForm />
        </section>
      </div>
    </main>
  );
}
