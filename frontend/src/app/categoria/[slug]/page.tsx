import { notFound } from 'next/navigation';
import { getArticles, getCategories } from '@/services/api';
import ArticleCard from '@/components/articles/ArticleCard';
import type { Metadata } from 'next';
import type { Category } from '@/types';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const categories = await getCategories();
    const category = categories.find((c) => c.slug === params.slug);
    if (category) {
      return {
        title: `${category.name} — NovaTech`,
        description: category.description ?? undefined,
      };
    }
  } catch {}
  return { title: 'Categoria — NovaTech' };
}

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: Props) {
  const [categoriesResult, articlesResult] = await Promise.allSettled([
    getCategories(),
    getArticles({ category: params.slug, per_page: 12 }),
  ]);

  const categories =
    categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];

  const category: Category | undefined = categories.find(
    (c) => c.slug === params.slug
  );

  if (!category) {
    notFound();
  }

  const articles =
    articlesResult.status === 'fulfilled' ? articlesResult.value.data : [];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-white">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-muted">{category.description}</p>
        )}
        {category.articles_count !== undefined && (
          <p className="mt-1 text-sm text-muted">
            {category.articles_count} artigo(s) publicado(s)
          </p>
        )}
      </div>

      {/* Articles */}
      {articles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-5xl">📭</span>
          <p className="text-muted">Nenhum artigo publicado nesta categoria ainda.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
