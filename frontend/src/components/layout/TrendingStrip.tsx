import { getArticles } from '@/services/api'
import { getI18n } from '@/i18n/server'

export default async function TrendingStrip() {
  const { dict } = getI18n()
  let titles: string[] = dict.trending.fallbackTitles

  try {
    const data = await getArticles({ per_page: 8 })
    if (data.data.length > 0) {
      titles = data.data.map((a) => a.title)
    }
  } catch {
    // use fallback
  }

  // Duplicar para loop contínuo
  const doubled = [...titles, ...titles]

  return (
    <div className="border-b border-border bg-bg2 py-2.5 overflow-hidden">
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
    </div>
  )
}
