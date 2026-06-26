'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type FormErrors = {
  nickname?: string;
  password?: string;
  general?: string;
};

export default function AuthPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('kminchelle');
  const [password, setPassword] = useState('0lelplR');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!nickname.trim()) {
      nextErrors.nickname = 'Informe o apelido.';
    } else if (nickname.trim().length < 3) {
      nextErrors.nickname = 'O apelido deve ter pelo menos 3 caracteres.';
    }

    if (!password) {
      nextErrors.password = 'Informe a senha.';
    } else if (password.length < 4) {
      nextErrors.password = 'A senha deve ter pelo menos 4 caracteres.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch('https://dummyjson.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: nickname.trim(),
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('Não foi possível autenticar com as credenciais informadas.');
      }

      const data = await response.json();

      localStorage.setItem(
        'auth-user',
        JSON.stringify({
          username: data.username ?? nickname.trim(),
          token: data.token ?? null,
        }),
      );

      router.push('/dashboard');
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro inesperado durante a autenticação.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Autenticação
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Entre na sua conta
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          Use o apelido e a senha para acessar o painel da atividade.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="nickname">
              Apelido
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none transition focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="Digite seu apelido"
            />
            {errors.nickname ? (
              <p className="mt-2 text-sm text-red-600">{errors.nickname}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none transition focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="Digite sua senha"
            />
            {errors.password ? (
              <p className="mt-2 text-sm text-red-600">{errors.password}</p>
            ) : null}
          </div>

          {errors.general ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {errors.general}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-300">
          Voltar para a{' '}
          <Link href="/" className="font-medium text-zinc-950 dark:text-zinc-100">
            página inicial
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
