import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <section className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Atividade Frontend
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Amanda Lara Duarte da Costa
        </h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          Atividade avaliativa de frontend da POS, ministrada pelo professor minora🤓.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/auth"
            className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
          >
            Fazer login
          </Link>
        </div>
      </section>
    </main>
  );
}
