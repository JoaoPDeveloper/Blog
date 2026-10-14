import axios from 'axios'
import type { Article, Category, PaginatedResponse } from '@/types'

// Server-side (dentro do Docker): usa o nome do serviço na rede interna
// Client-side (navegador): usa localhost com a porta exposta
function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.API_URL || 'http://backend:8000/api/v1'
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'
}

function createApi() {
  return axios.create({
    baseURL: getBaseUrl(),
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
}

export async function getArticles(params?: {
  category?: string
  search?: string
  page?: number
  per_page?: number
}): Promise<PaginatedResponse<Article>> {
  const { data } = await createApi().get<PaginatedResponse<Article>>('/articles', { params })
  return data
}

export async function getArticle(slug: string): Promise<Article> {
  const { data } = await createApi().get<Article>(`/articles/${slug}`)
  return data
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await createApi().get<Category[]>('/categories')
  return data
}
