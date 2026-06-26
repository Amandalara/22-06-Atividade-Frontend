'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type StoredUser = {
  username: string;
  token: string | null;
};

export default function DashboardPage() {
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const storedUser = window.localStorage.getItem('auth-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser) as StoredUser);
    }
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <section className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Dashboard
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Bem-vindo ao painel
        </h1>
        <p className="mt-3 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          {user ? `Usuário autenticado: ${user.username}` : 'Nenhum usuário autenticado.'}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Voltar à home
          </Link>
          <Link
            href="/auth"
            className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
          >
            Fazer novo login
          </Link>
        </div>
      </section>
    </main>
  );
}
