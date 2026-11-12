import type { Locale } from '@/i18n/config';

export interface Dictionary {
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogLocale: string;
  };
  nav: {
    home: string;
    ai: string;
    games: string;
    anime: string;
    searchPlaceholder: string;
    themeLabel: string;
    themeToLight: string;
    themeToDark: string;
    languageLabel: string;
    languagePt: string;
    languageEn: string;
  };
  trending: {
    label: string;
    fallbackTitles: string[];
  };
  footer: {
    about: string;
    copyright: string;
  };
  home: {
    emptyTitle: string;
    emptyText: string;
    latest: string;
  };
  article: {
    metaFallbackTitle: string;
    fallbackCategory: string;
    featuredCategory: string;
    aiBadge: string;
    generatedWithAi: string;
    sources: string;
    portugueseNotice: string | null;
  };
  category: {
    metaFallbackTitle: string;
    articlesCount: string;
    empty: string;
  };
  search: {
    title: string;
    resultsFor: string;
    resultsCount: string;
    hint: string;
    noResults: string;
  };
  notFound: {
    title: string;
    text: string;
    back: string;
  };
  palette: {
    title: string;
    placeholder: string;
    recentSearches: string;
    clearHistory: string;
    removeItem: string;
    searchFor: string;
    openLabel: string;
    noRecent: string;
    close: string;
    hintNavigate: string;
    hintSelect: string;
    hintClose: string;
  };
  hashtags: {
    trending: string;
    empty: string;
    articlesCount: string;
    taggedWith: string;
    metaFallbackTitle: string;
    noArticles: string;
  };
  categories: Record<string, string>;
  categoryDescriptions: Record<string, string>;
}

const ptBR: Dictionary = {
  meta: {
    title: 'NovaTech — Notícias de IA, Jogos e Animes',
    description:
      'As últimas notícias sobre Inteligência Artificial, Jogos e Animes, geradas com assistência de IA.',
    ogTitle: 'NovaTech Blog',
    ogDescription: 'Notícias de IA, Jogos e Animes',
    ogLocale: 'pt_BR',
  },
  nav: {
    home: 'Início',
    ai: 'IA',
    games: 'Jogos',
    anime: 'Animes',
    searchPlaceholder: 'Buscar...',
    themeLabel: 'Modo escuro',
    themeToLight: 'Mudar para o tema claro',
    themeToDark: 'Mudar para o tema escuro',
    languageLabel: 'Idioma',
    languagePt: 'Português (Brasil)',
    languageEn: 'English',
  },
  trending: {
    label: 'Em Alta',
    fallbackTitles: [
      'GPT-5 lançado com capacidades multimodais avançadas',
      'GTA VI confirma data de lançamento em 2025',
      'Demon Slayer: Infinity Castle chega ao cinema',
      'Google Gemini 3.8 supera benchmarks da OpenAI',
      'Nintendo anuncia novo título para Switch 2',
    ],
  },
  footer: {
    about:
      'Conteúdo gerado com assistência de Inteligência Artificial (Google Gemini). Os artigos são baseados em fontes verificáveis e passam por revisão editorial. As fontes originais são sempre citadas.',
    copyright: '© {year} NovaTech. Conteúdo assistido por IA — sempre com transparência.',
  },
  home: {
    emptyTitle: 'Nenhum artigo publicado ainda',
    emptyText: 'Volte em breve — nosso sistema de coleta está em operação.',
    latest: 'Últimas notícias',
  },
  article: {
    metaFallbackTitle: 'Artigo — NovaTech',
    fallbackCategory: 'Geral',
    featuredCategory: 'Destaque',
    aiBadge: 'IA',
    generatedWithAi: 'Gerado com IA ({provider})',
    sources: 'Fontes',
    portugueseNotice: null,
  },
  category: {
    metaFallbackTitle: 'Categoria — NovaTech',
    articlesCount: '{count} artigo(s) publicado(s)',
    empty: 'Nenhum artigo publicado nesta categoria ainda.',
  },
  search: {
    title: 'Busca',
    resultsFor: 'Resultados para "{query}"',
    resultsCount: '{count} resultado(s) encontrado(s)',
    hint: 'Use a barra de busca no topo para pesquisar artigos.',
    noResults: 'Nenhum resultado encontrado para “{query}”.',
  },
  notFound: {
    title: 'Página não encontrada',
    text: 'A página que você está procurando não existe ou foi removida.',
    back: 'Voltar ao início',
  },
  palette: {
    title: 'Pesquisar',
    placeholder: 'Pesquisar artigos...',
    recentSearches: 'Pesquisas recentes',
    clearHistory: 'Limpar histórico',
    removeItem: 'Remover "{term}" do histórico',
    searchFor: 'Pesquisar por "{query}"',
    openLabel: 'Abrir pesquisa',
    noRecent: 'Nenhuma pesquisa recente',
    close: 'Fechar',
    hintNavigate: 'navegar',
    hintSelect: 'selecionar',
    hintClose: 'fechar',
  },
  hashtags: {
    trending: 'Hashtags em alta',
    empty: 'Nenhuma hashtag em alta ainda',
    articlesCount: '{count} artigo(s)',
    taggedWith: 'Artigos com {tag}',
    metaFallbackTitle: 'Hashtag — NovaTech',
    noArticles: 'Nenhum artigo publicado com esta hashtag ainda.',
  },
  categories: {
    'inteligencia-artificial': 'Inteligência Artificial',
    jogos: 'Jogos',
    'animes-mangas': 'Animes & Mangás',
  },
  categoryDescriptions: {},
};

const en: Dictionary = {
  meta: {
    title: 'NovaTech — AI, Games and Anime News',
    description:
      'The latest news about Artificial Intelligence, Games and Anime, generated with AI assistance.',
    ogTitle: 'NovaTech Blog',
    ogDescription: 'AI, Games and Anime news',
    ogLocale: 'en_US',
  },
  nav: {
    home: 'Home',
    ai: 'AI',
    games: 'Games',
    anime: 'Anime',
    searchPlaceholder: 'Search...',
    themeLabel: 'Dark mode',
    themeToLight: 'Switch to light theme',
    themeToDark: 'Switch to dark theme',
    languageLabel: 'Language',
    languagePt: 'Português (Brasil)',
    languageEn: 'English',
  },
  trending: {
    label: 'Trending',
    fallbackTitles: [
      'GPT-5 launched with advanced multimodal capabilities',
      'GTA VI confirms release date in 2025',
      'Demon Slayer: Infinity Castle hits theaters',
      'Google Gemini 3.8 beats OpenAI on benchmarks',
      'Nintendo announces new title for Switch 2',
    ],
  },
  footer: {
    about:
      'Content generated with the assistance of Artificial Intelligence (Google Gemini). Articles are based on verifiable sources and go through editorial review. Original sources are always cited.',
    copyright: '© {year} NovaTech. AI-assisted content — always transparent.',
  },
  home: {
    emptyTitle: 'No articles published yet',
    emptyText: 'Check back soon — our collection system is up and running.',
    latest: 'Latest news',
  },
  article: {
    metaFallbackTitle: 'Article — NovaTech',
    fallbackCategory: 'General',
    featuredCategory: 'Featured',
    aiBadge: 'AI',
    generatedWithAi: 'AI-generated ({provider})',
    sources: 'Sources',
    portugueseNotice: 'This article is written in Portuguese',
  },
  category: {
    metaFallbackTitle: 'Category — NovaTech',
    articlesCount: '{count} published article(s)',
    empty: 'No articles published in this category yet.',
  },
  search: {
    title: 'Search',
    resultsFor: 'Results for "{query}"',
    resultsCount: '{count} result(s) found',
    hint: 'Use the search bar at the top to search for articles.',
    noResults: 'No results found for “{query}”.',
  },
  notFound: {
    title: 'Page not found',
    text: 'The page you are looking for does not exist or has been removed.',
    back: 'Back to home',
  },
  palette: {
    title: 'Search',
    placeholder: 'Search articles...',
    recentSearches: 'Recent searches',
    clearHistory: 'Clear history',
    removeItem: 'Remove "{term}" from history',
    searchFor: 'Search for "{query}"',
    openLabel: 'Open search',
    noRecent: 'No recent searches',
    close: 'Close',
    hintNavigate: 'navigate',
    hintSelect: 'select',
    hintClose: 'close',
  },
  hashtags: {
    trending: 'Trending hashtags',
    empty: 'No trending hashtags yet',
    articlesCount: '{count} article(s)',
    taggedWith: 'Articles tagged {tag}',
    metaFallbackTitle: 'Hashtag — NovaTech',
    noArticles: 'No articles published with this hashtag yet.',
  },
  categories: {
    'inteligencia-artificial': 'Artificial Intelligence',
    jogos: 'Games',
    'animes-mangas': 'Anime & Manga',
  },
  categoryDescriptions: {
    'inteligencia-artificial': 'News about AI, language models, tools and trends.',
    jogos: 'Releases, updates, sales and news from the world of games.',
    'animes-mangas': 'Season announcements, premieres, trailers and studio news.',
  },
};

export const dictionaries: Record<Locale, Dictionary> = {
  'pt-BR': ptBR,
  en,
};
