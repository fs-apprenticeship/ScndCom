import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-sm font-semibold" href="/">
            ScndCom
          </Link>
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
            <Link
              className="inline-flex items-center justify-center rounded-md border px-6 py-2.5 text-sm font-medium"
              href="/gmail"
            >
              Gmail
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
