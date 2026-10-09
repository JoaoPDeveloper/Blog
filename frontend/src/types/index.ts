export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  articles_count?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface ArticleSource {
  id: number;
  article_id: number;
  source_id: number | null;
  source_url: string;
  source_title: string | null;
  source_published_at: string | null;
  retrieved_at: string | null;
}

export interface Article {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  status: 'draft' | 'review' | 'published';
  language: string;
  original_published_at: string | null;
  published_at: string | null;
  ai_provider: string | null;
  ai_model: string | null;
  content_hash: string | null;
  review_status: 'pending' | 'approved' | 'rejected';
  category: Category;
  tags: Tag[];
  sources?: ArticleSource[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}
