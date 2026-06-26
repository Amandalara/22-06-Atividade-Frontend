'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type StoredUser = {
  username: string;
  token: string | null;
};

type QuoteItem = {
  id: number;
  quote: string;
  author: string;
};

type QuoteFormState = {
  quote: string;
  author: string;
  editingId: number | null;
};

const STORAGE_KEYS = {
  user: 'auth-user',
  quotes: 'dashboard-quotes',
  authors: 'dashboard-authors',
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [form, setForm] = useState<QuoteFormState>({
    quote: '',
    author: '',
    editingId: null,
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = window.localStorage.getItem(STORAGE_KEYS.user);
    if (!storedUser) {
      router.replace('/auth');
      return;
    }

    const parsedUser = JSON.parse(storedUser) as StoredUser;
    setUser(parsedUser);

    const storedQuotes = window.localStorage.getItem(STORAGE_KEYS.quotes);
    const storedAuthors = window.localStorage.getItem(STORAGE_KEYS.authors);

    if (storedQuotes) {
      const parsedQuotes = JSON.parse(storedQuotes) as QuoteItem[];
      setQuotes(parsedQuotes);
      if (storedAuthors) {
        setAuthors(JSON.parse(storedAuthors) as string[]);
      } else {
        setAuthors([...new Set(parsedQuotes.map((item) => item.author).filter(Boolean))]);
      }
      setLoading(false);
      return;
    }

    const loadQuotes = async () => {
      try {
        const response = await fetch('https://dummyjson.com/quotes?limit=6');
        if (!response.ok) {
          throw new Error('Não foi possível carregar as citações.');
        }

        const data = (await response.json()) as { quotes?: QuoteItem[] };
        const nextQuotes = (data.quotes ?? []).map((item, index) => ({
          id: item.id ?? index + 1,
          quote: item.quote,
          author: item.author,
        }));

        setQuotes(nextQuotes);
        const nextAuthors = [...new Set(nextQuotes.map((item) => item.author).filter(Boolean))];
        setAuthors(nextAuthors);
        window.localStorage.setItem(STORAGE_KEYS.quotes, JSON.stringify(nextQuotes));
        window.localStorage.setItem(STORAGE_KEYS.authors, JSON.stringify(nextAuthors));
      } catch {
        setStatus('Não foi possível carregar as citações no momento.');
      } finally {
        setLoading(false);
      }
    };

    void loadQuotes();
  }, [router]);

  const persistQuotes = (nextQuotes: QuoteItem[]) => {
    setQuotes(nextQuotes);
    window.localStorage.setItem(STORAGE_KEYS.quotes, JSON.stringify(nextQuotes));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const quote = form.quote.trim();
    const author = form.author.trim();

    if (!quote || !author) {
      setStatus('Preencha a frase e o autor antes de salvar.');
      return;
    }

    setStatus('');

    const nextAuthors = [...new Set([...authors, author])];
    setAuthors(nextAuthors);
    window.localStorage.setItem(STORAGE_KEYS.authors, JSON.stringify(nextAuthors));

    if (form.editingId !== null) {
      const updatedQuotes = quotes.map((item) =>
        item.id === form.editingId
          ? {
              ...item,
              quote,
              author,
            }
          : item,
      );
      persistQuotes(updatedQuotes);
    } else {
      const newQuote: QuoteItem = {
        id: Date.now(),
        quote,
        author,
      };
      persistQuotes([newQuote, ...quotes]);
    }

    setForm({ quote: '', author: '', editingId: null });
  };

  const handleEdit = (quote: QuoteItem) => {
    setForm({
      quote: quote.quote,
      author: quote.author,
      editingId: quote.id,
    });
  };

  const handleDelete = (id: number) => {
    const updatedQuotes = quotes.filter((item) => item.id !== id);
    persistQuotes(updatedQuotes);
    setForm({ quote: '', author: '', editingId: null });
  };

  const handleLogout = () => {
    window.localStorage.removeItem(STORAGE_KEYS.user);
    document.cookie = 'auth-user=; path=/; max-age=0; SameSite=Lax';
    router.replace('/auth');
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
                Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Gestão de frases célebres
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
                {user
                  ? `Olá, ${user.username}. Aqui você pode visualizar citações da API DummyJSON e gerenciar seu próprio conjunto.`
                  : 'Acesso restrito.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Sair
            </button>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Citações</h2>
              <span className="text-sm text-zinc-500">{quotes.length} itens</span>
            </div>

            {loading ? (
              <p className="mt-6 text-sm text-zinc-500">Carregando citações...</p>
            ) : quotes.length === 0 ? (
              <p className="mt-6 text-sm text-zinc-500">Nenhuma citação cadastrada ainda.</p>
            ) : (
              <ul className="mt-6 space-y-4">
                {quotes.map((item) => (
                  <li key={item.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <p className="text-base leading-7 text-zinc-700 dark:text-zinc-200">“{item.quote}”</p>
                    <p className="mt-2 text-sm font-medium text-zinc-500">— {item.author}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="rounded-full border border-zinc-300 px-4 py-2 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                      >
                        Apagar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-semibold">
              {form.editingId !== null ? 'Editar citação' : 'Nova citação'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Valide a frase e o autor antes de salvar. Os autores ficam salvos localmente para facilitar a digitação.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium" htmlFor="quote">
                  Frase
                </label>
                <textarea
                  id="quote"
                  value={form.quote}
                  onChange={(event) => setForm((current) => ({ ...current, quote: event.target.value }))}
                  className="min-h-28 w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none transition focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800"
                  placeholder="Digite a frase"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" htmlFor="author">
                  Autor
                </label>
                <input
                  id="author"
                  list="authors-list"
                  value={form.author}
                  onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none transition focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800"
                  placeholder="Digite ou selecione um autor"
                />
                <datalist id="authors-list">
                  {authors.map((author) => (
                    <option key={author} value={author} />
                  ))}
                </datalist>
              </div>

              {status ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  {status}
                </p>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
              >
                {form.editingId !== null ? 'Salvar alterações' : 'Adicionar citação'}
              </button>
            </form>
          </section>
        </div>

        <div className="flex justify-start">
          <Link href="/" className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-100">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </main>
  );
}
