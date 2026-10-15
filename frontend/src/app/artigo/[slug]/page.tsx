import { notFound } from 'next/navigation';

export const revalidate = 300;
import { getArticle } from '@/services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const article = await getArticle(params.slug);
    return {
      title: `${article.title} — NovaTech`,
      description: article.summary ?? undefined,
    };
  } catch {
    return { title: 'Artigo — NovaTech' };
  }
}

export default async function ArticlePage({ params }: Props) {
  let article;

  try {
    article = await getArticle(params.slug);
  } catch {
    notFound();
  }

  const publishedAt = article.published_at
    ? format(new Date(article.published_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null;

  // Replace newlines with <br> for plain text content
  const contentHtml = article.content.replace(/\n/g, '<br />');

  return (
    <article className="mx-auto max-w-3xl">
      {/* Category */}
      <div className="mb-4">
        <span className="rounded bg-accent/20 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          {article.category?.name}
        </span>
      </div>

      {/* Title */}
      <h1 className="mb-4 text-3xl font-bold leading-tight text-white">
        {article.title}
      </h1>

      {/* Meta */}
      <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted">
        {publishedAt && <span>{publishedAt}</span>}
        {article.ai_provider && (
          <span className="rounded bg-bg3 px-2 py-0.5 text-xs">
            Gerado com IA ({article.ai_provider})
          </span>
        )}
      </div>

      {/* Summary */}
      {article.summary && (
        <p className="mb-6 rounded-lg border-l-4 border-accent bg-bg2 p-4 text-base text-muted">
          {article.summary}
        </p>
      )}

      {/* Content */}
      <div
        className="prose prose-invert max-w-none text-gray-300"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full border border-border bg-bg3 px-3 py-1 text-xs text-muted"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Sources */}
      {article.sources && article.sources.length > 0 && (
        <div className="mt-10 border-t border-border pt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
            Fontes
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
