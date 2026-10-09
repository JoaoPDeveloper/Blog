import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Article } from '@/types';

const categoryGradientMap: Record<string, string> = {
  'inteligencia-artificial': 'from-ai/20 to-transparent',
  jogos: 'from-games/20 to-transparent',
  'animes-mangas': 'from-anime/20 to-transparent',
};

const categoryEmojiMap: Record<string, string> = {
  'inteligencia-artificial': '🤖',
  jogos: '🎮',
  'animes-mangas': '🎌',
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

export default function HeroArticle({ article }: Props) {
  const slug = article.category?.slug ?? '';
  const gradient = categoryGradientMap[slug] ?? 'from-accent/20 to-transparent';
  const emoji = categoryEmojiMap[slug] ?? '📰';

  return (
    <Link
      href={`/artigo/${article.slug}`}
      className={`group relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${gradient} bg-bg2 p-6 transition-all hover:border-accent/50`}
    >
      {/* Emoji decoration */}
      <span className="absolute right-6 top-6 text-5xl opacity-20 group-hover:opacity-40 transition-opacity">
        {emoji}
      </span>

      <div className="relative flex flex-col gap-3">
        <span className="w-fit rounded bg-accent/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-accent">
          {article.category?.name ?? 'Destaque'}
        </span>

        <h2 className="text-2xl font-bold leading-tight text-white group-hover:text-accent2 transition-colors">
          {article.title}
        </h2>

        {article.summary && (
          <p className="line-clamp-2 text-sm text-muted">{article.summary}</p>
        )}

        <span className="text-xs text-muted">{formatDate(article.published_at)}</span>
      </div>
    </Link>
  );
}
