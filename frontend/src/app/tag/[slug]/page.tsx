import { getArticles } from '@/services/api';
import ArticleCard from '@/components/articles/ArticleCard';
import { getI18n } from '@/i18n/server';
import { formatHashtag, interpolate } from '@/i18n/utils';
import type { Metadata } from 'next';
import type { Article } from '@/types';

interface Props {
  params: { slug: string };
}

function getTagLabel(slug: string, articles: Article[]): string {
  const tag = articles
    .flatMap((article) => article.tags ?? [])
    .find((t) => t.slug === slug);
  return formatHashtag(tag?.name ?? slug.replace(/-/g, ''));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dict } = getI18n();
  try {
    const data = await getArticles({ tag: params.slug, per_page: 24 });
    const label = getTagLabel(params.slug, data.data);
    return {
      title: `${label} — NovaTech`,
      description: interpolate(dict.hashtags.taggedWith, { tag: label }),
    };
  } catch {
    return { title: dict.hashtags.metaFallbackTitle };
  }
}

export const dynamic = 'force-dynamic';

export default async function TagPage({ params }: Props) {
  const { dict } = getI18n();
  let articles: Article[] = [];
  let total = 0;

  try {
    const data = await getArticles({ tag: params.slug, per_page: 24 });
    articles = data.data;
    total = data.total;
  } catch {
    // API unavailable — show empty state
  }

  const label = getTagLabel(params.slug, articles);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="break-words text-3xl font-bold text-fg">{label}</h1>
        {articles.length > 0 && (
          <p className="mt-2 text-sm text-muted">
            {interpolate(dict.hashtags.articlesCount, { count: total })}
          </p>
        )}
      </div>

      {/* Articles */}
      {articles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-5xl">📭</span>
          <p className="text-muted">{dict.hashtags.noArticles}</p>
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
