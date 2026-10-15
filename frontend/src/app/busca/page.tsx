import { Search } from 'lucide-react';

import ArticleCard from '@/components/articles/ArticleCard';
import { getArticles } from '@/services/api';
import type { Article } from '@/types';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q?.trim() ?? '';

  let articles: Article[] = [];

  if (query) {
    try {
      const data = await getArticles({ search: query, per_page: 20 });
      articles = data.data;
    } catch {
      // show empty state
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <Search className="h-6 w-6 text-muted" />
          <h1 className="text-2xl font-bold text-white">
            {query ? `Resultados para "${query}"` : 'Busca'}
          </h1>
        </div>
        {query && (
          <p className="mt-1 text-sm text-muted">
            {articles.length} resultado(s) encontrado(s)
          </p>
        )}
      </div>

      {!query ? (
        <p className="text-center text-muted">
          Use a barra de busca no topo para pesquisar artigos.
        </p>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-5xl">🔍</span>
          <p className="text-muted">
            Nenhum resultado encontrado para &ldquo;{query}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
