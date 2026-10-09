import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Article } from '@/types';

const categoryColorMap: Record<string, string> = {
  'inteligencia-artificial': 'text-ai border-ai',
  jogos: 'text-games border-games',
  'animes-mangas': 'text-anime border-anime',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return '';
  }
}

interface Props {
  article: Article;
}

export default function ArticleCard({ article }: Props) {
  const colorClass =
    categoryColorMap[article.category?.slug ?? ''] ?? 'text-accent border-accent';

  return (
    <Link
      href={`/artigo/${article.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-bg2 p-4 transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
    >
      {/* Category badge */}
      <span
        className={`inline-block w-fit rounded border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${colorClass}`}
      >
        {article.category?.name ?? 'Geral'}
      </span>

      {/* Title */}
      <h3 className="line-clamp-2 text-base font-bold text-white group-hover:text-accent2 transition-colors">
        {article.title}
      </h3>

      {/* Summary */}
      {article.summary && (
        <p className="line-clamp-3 text-sm text-muted">{article.summary}</p>
      )}

      {/* Date */}
      <div className="mt-auto flex items-center justify-between">
        <span className="text-xs text-muted">
          {formatDate(article.published_at)}
        </span>
        {article.ai_provider && (
          <span className="rounded bg-bg3 px-1.5 py-0.5 text-xs text-muted">
            IA
          </span>
        )}
      </div>
    </Link>
  );
}
