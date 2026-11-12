import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Languages } from 'lucide-react';
import { getArticle } from '@/services/api';
import { getI18n } from '@/i18n/server';
import { formatDate, formatHashtag, getCategoryName, interpolate } from '@/i18n/utils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dict } = getI18n();
  try {
    const article = await getArticle(params.slug);
    return {
      title: `${article.title} — NovaTech`,
      description: article.summary ?? undefined,
    };
  } catch {
    return { title: dict.article.metaFallbackTitle };
  }
}

export default async function ArticlePage({ params }: Props) {
  const { locale, dict } = getI18n();
  let article;

  try {
    article = await getArticle(params.slug);
  } catch {
    notFound();
  }

  const publishedAt = formatDate(article.published_at, locale);
  const portugueseNotice = dict.article.portugueseNotice;
  const contentLang = portugueseNotice ? 'pt-BR' : undefined;

  // Replace newlines with <br> for plain text content
  const contentHtml = article.content.replace(/\n/g, '<br />');

  return (
    <article className="mx-auto max-w-3xl">
      {/* Category */}
      <div className="mb-4">
        <span className="rounded bg-accent/20 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          {article.category && getCategoryName(dict, article.category)}
        </span>
      </div>

      {/* Title */}
      <h1 lang={contentLang} className="mb-4 text-3xl font-bold leading-tight text-fg">
        {article.title}
      </h1>

      {/* Meta */}
      <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted">
        {publishedAt && <span>{publishedAt}</span>}
        {article.ai_provider && (
          <span className="rounded bg-bg3 px-2 py-0.5 text-xs">
            {interpolate(dict.article.generatedWithAi, { provider: article.ai_provider })}
          </span>
        )}
        {portugueseNotice && (
          <span className="flex items-center gap-1.5 text-xs">
            <Languages className="h-3.5 w-3.5" aria-hidden="true" />
            {portugueseNotice}
          </span>
        )}
      </div>

      {/* Summary */}
      {article.summary && (
        <p
          lang={contentLang}
          className="mb-6 rounded-lg border-l-4 border-accent bg-bg2 p-4 text-base text-muted"
        >
          {article.summary}
        </p>
      )}

      {/* Content */}
      <div
        lang={contentLang}
        className="prose prose-invert max-w-none text-fg/80"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${encodeURIComponent(tag.slug)}`}
              className="rounded-full border border-border bg-bg3 px-3 py-1 text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent2"
            >
              {formatHashtag(tag.name)}
            </Link>
          ))}
        </div>
      )}

      {/* Sources */}
      {article.sources && article.sources.length > 0 && (
        <div className="mt-10 border-t border-border pt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
            {dict.article.sources}
          </h2>
          <ul className="flex flex-col gap-2">
            {article.sources.map((source) => (
              <li key={source.id}>
                <a
                  href={source.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent2 hover:underline"
                >
                  {source.source_title ?? source.source_url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
