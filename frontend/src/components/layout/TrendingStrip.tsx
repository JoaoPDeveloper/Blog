import { getArticles } from '@/services/api'

const fallbackTitles = [
  'GPT-5 lançado com capacidades multimodais avançadas',
  'GTA VI confirma data de lançamento em 2025',
  'Demon Slayer: Infinity Castle chega ao cinema',
  'Google Gemini 3.8 supera benchmarks da OpenAI',
  'Nintendo anuncia novo título para Switch 2',
]

export default async function TrendingStrip() {
  let titles: string[] = fallbackTitles

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
    <div className="border-b border-[#2a2d3e] bg-[#1a1d27] py-2.5 overflow-hidden">
      <div className="flex items-center gap-0">
        {/* Label fixo */}
        <div className="shrink-0 bg-[#6c63ff] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white z-10 relative">
          🔥 Em Alta
        </div>
        {/* Faixa animada — pausa no hover */}
        <div className="overflow-hidden flex-1">
          <div
            className="flex gap-0 animate-marquee"
          >
            {doubled.map((title, i) => (
              <span
                key={i}
                className="whitespace-nowrap text-sm text-[#8b8fa8] px-6 border-r border-[#2a2d3e] hover:text-white transition-colors cursor-default"
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
