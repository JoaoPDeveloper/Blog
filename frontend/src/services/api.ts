import type { Article, Category, PaginatedResponse } from '@/types'

// Server-side: nome do serviço Docker; Client-side: localhost com porta exposta
function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.API_URL || 'http://backend:8000/api/v1'
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${getBaseUrl()}${path}`

  // Timeout de 15s para Railway (cold start pode ser lento)
  const timeoutSignal = AbortSignal.timeout(15000)

  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    signal: timeoutSignal,
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`)
  }
  return res.json()
}

export async function getArticles(params?: {
  category?: string
  search?: string
  page?: number
  per_page?: number
}): Promise<PaginatedResponse<Article>> {
  const qs = params
    ? '?' + new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : ''
  return apiFetch<PaginatedResponse<Article>>(`/articles${qs}`, {
    next: { revalidate: 120 }, // cache por 2 minutos
  })
}

export async function getArticle(slug: string): Promise<Article> {
  return apiFetch<Article>(`/articles/${slug}`, {
    next: { revalidate: 300 }, // cache por 5 minutos
  })
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories', {
    next: { revalidate: 600 }, // categorias mudam pouco — cache por 10 minutos
  })
}
