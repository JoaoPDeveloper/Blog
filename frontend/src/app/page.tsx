import { getArticles } from '@/services/api';
import HeroArticle from '@/components/articles/HeroArticle';
import ArticleCard from '@/components/articles/ArticleCard';

export const revalidate = 300;

export default async function HomePage() {
  let articles = [];

  try {
    const data = await getArticles({ per_page: 9 });
    articles = data.data;
  } catch {
    // API unavailable — show empty state
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <span className="text-6xl">📰</span>
        <h1 className="text-2xl font-bold text-white">Nenhum artigo publicado ainda</h1>
        <p className="text-muted">
          Volte em breve — nosso sistema de coleta está em operação.
        </p>
      </div>
    );
  }

  const [hero, ...rest] = articles;
  const sideArticles = rest.slice(0, 2);
  const gridArticles = rest.slice(2);

  return (
    <div className="flex flex-col gap-10">
      {/* Hero + Side */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HeroArticle article={hero} />
        </div>
        <div className="flex flex-col gap-4">
          {sideArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* Grid */}
      {gridArticles.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-white">Últimas notícias</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gridArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
