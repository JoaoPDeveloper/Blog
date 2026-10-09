import { getArticles } from '@/services/api';

const fallbackTitles = [
  'Gemini 2.0 Flash: o modelo de IA mais acessível do Google',
  'Novos lançamentos de jogos para julho de 2025',
  'Animes mais esperados da temporada de verão',
  'OpenAI lança atualização no GPT-4o',
  'Nintendo anuncia novo título exclusivo',
];

export default async function TrendingStrip() {
  let titles: string[] = fallbackTitles;

  try {
    const data = await getArticles({ per_page: 5 });
    if (data.data.length > 0) {
      titles = data.data.map((a) => a.title);
    }
  } catch {
    // use fallback
  }

  return (
    <div className="border-b border-border bg-bg3 py-2">
      <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-hidden px-4">
        <span className="shrink-0 rounded bg-accent px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-white">
          Em Alta
        </span>
        <div className="flex animate-[marquee_30s_linear_infinite] gap-8 whitespace-nowrap">
          {[...titles, ...titles].map((title, i) => (
            <span key={i} className="text-sm text-muted">
              {title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
