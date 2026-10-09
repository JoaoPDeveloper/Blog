import axios from 'axios';
import type { Article, Category, PaginatedResponse } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export async function getArticles(params?: {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
}): Promise<PaginatedResponse<Article>> {
  const response = await api.get<PaginatedResponse<Article>>('/articles', { params });
  return response.data;
}

export async function getArticle(slug: string): Promise<Article> {
  const response = await api.get<Article>(`/articles/${slug}`);
  return response.data;
}

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>('/categories');
  return response.data;
}

export default api;
