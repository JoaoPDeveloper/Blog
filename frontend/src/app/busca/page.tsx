import { Search } from 'lucide-react';

import ArticleCard from '@/components/articles/ArticleCard';
import { getI18n } from '@/i18n/server';
import { interpolate } from '@/i18n/utils';
import { getArticles } from '@/services/api';
import type { Article } from '@/types';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const { dict } = getI18n();
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
          <h1 className="text-2xl font-bold text-fg">
            {query ? interpolate(dict.search.resultsFor, { query }) : dict.search.title}
          </h1>
        </div>
        {query && (
          <p className="mt-1 text-sm text-muted">
            {interpolate(dict.search.resultsCount, { count: articles.length })}
          </p>
        )}
      </div>

      {!query ? (
        <p className="text-center text-muted">{dict.search.hint}</p>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-5xl">🔍</span>
          <p className="text-muted">
            {interpolate(dict.search.noResults, { query })}
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
