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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-bg2 transition-all hover:border-accent/50"
    >
      {/* Thumbnail */}
      <div className="relative h-72 overflow-hidden">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div className={`${article.image_url ? 'hidden' : ''} h-72 bg-gradient-to-br ${gradient} flex items-center justify-center text-8xl`}>
          <span className="z-10">{emoji}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d27] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col gap-3 p-6">
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
