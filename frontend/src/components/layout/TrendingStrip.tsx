import Link from 'next/link'
import { Hash } from 'lucide-react'
import { getArticles, getTrendingTags } from '@/services/api'
import { getI18n } from '@/i18n/server'
import { formatHashtag, interpolate } from '@/i18n/utils'
import type { TrendingTag } from '@/types'

// Cada metade do loop precisa ter chips suficientes para cobrir telas largas
const MIN_CHIPS_PER_HALF = 16

async function loadTitles(fallback: string[]): Promise<string[]> {
  try {
    const data = await getArticles({ per_page: 8 })
    if (data.data.length > 0) {
      return data.data.map((a) => a.title)
    }
  } catch {
    // use fallback
  }
  return fallback
}

function repeatToMin(tags: TrendingTag[], min: number): TrendingTag[] {
  const times = Math.ceil(min / tags.length)
  return Array.from({ length: times }, () => tags).flat()
}

export default async function TrendingStrip() {
  const { dict } = getI18n()

  const [titles, tags] = await Promise.all([
    loadTitles(dict.trending.fallbackTitles),
    // sem hashtags (ou API sem o endpoint) a segunda linha não é renderizada
    getTrendingTags(12).catch((): TrendingTag[] => []),
  ])

  // Duplicar para loop contínuo
  const doubled = [...titles, ...titles]

  // Metade do loop: lista repetida até MIN_CHIPS_PER_HALF. As duas metades são idênticas
  // (translateX(-50%) emenda sem salto); a 2ª metade e as repetições ficam fora do tab/leitor de tela.
  const chips = tags.length > 0 ? repeatToMin(tags, MIN_CHIPS_PER_HALF) : []
  const renderHalf = (copy: boolean) => (
    <ul
      aria-hidden={copy ? true : undefined}
      aria-label={copy ? undefined : dict.hashtags.trending}
      className="flex shrink-0 min-w-[100vw] items-center justify-around"
    >
      {chips.map((tag, i) => {
        const hidden = copy || i >= tags.length
        const hashtag = formatHashtag(tag.name)
        const count = interpolate(dict.hashtags.articlesCount, {
          count: tag.articles_count,
        })

        return (
          <li key={`${tag.id}-${i}`} aria-hidden={hidden ? true : undefined} className="px-1.5">
            <Link
              href={`/tag/${encodeURIComponent(tag.slug)}`}
              tabIndex={hidden ? -1 : undefined}
              title={count}
              aria-label={`${hashtag}, ${count}`}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-bg px-2.5 py-0.5 text-xs font-medium text-fg transition-colors hover:border-accent/50 hover:text-accent2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
            >
              <span>{hashtag}</span>
              <span aria-hidden="true" className="text-[10px] font-normal tabular-nums text-muted">
                {tag.articles_count}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="border-b border-border bg-bg2 py-2.5 overflow-hidden space-y-1.5">
      <div className="flex items-center gap-0">
        {/* Label fixo */}
        <div className="shrink-0 bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-accent-fg z-10 relative">
          🔥 {dict.trending.label}
        </div>
        {/* Faixa animada — pausa no hover */}
        <div className="overflow-hidden flex-1">
          <div
            className="flex gap-0 animate-marquee"
          >
            {doubled.map((title, i) => (
              <span
                key={i}
                className="whitespace-nowrap text-sm text-muted px-6 border-r border-border hover:text-fg transition-colors cursor-default"
              >
                {title}
              </span>
            ))}
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex items-center gap-0">
          {/* Label fixo */}
          <div className="relative z-10 shrink-0 bg-accent2 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-bg">
            <span className="inline-flex items-center gap-1">
              <Hash className="h-3 w-3" aria-hidden="true" />
              {dict.hashtags.trending}
            </span>
          </div>
          {/* Faixa animada em sentido oposto — pausa no hover e no foco por teclado */}
          <div className="overflow-hidden flex-1">
            <div className="flex w-max animate-marquee-reverse">
              {renderHalf(false)}
              {renderHalf(true)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
