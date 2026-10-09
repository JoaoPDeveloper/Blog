# NovaTech — Blog de Notícias Automatizado com IA

Blog de notícias sobre **Inteligência Artificial, Jogos e Animes & Mangás**, com coleta
automatizada de fontes externas, geração de artigos assistida por IA (Google Gemini) e
publicação via painel administrativo.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | PHP 8.3 + Laravel 11 |
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Banco de dados | PostgreSQL 16 |
| Cache / Filas | Redis 7 |
| Busca | Elasticsearch 8.13 |
| IA principal | Google Gemini 2.0 Flash |
| IA alternativa | OpenAI GPT-4o-mini |
| Infraestrutura | Docker Compose |

---

## Como rodar com Docker Compose

### 1. Clone o repositório e prepare o `.env`

```bash
cp .env.example .env
```

Edite o `.env` e preencha as chaves obrigatórias:

```
GEMINI_API_KEY=sua_chave_aqui
NEWSAPI_KEY=sua_chave_aqui
APP_KEY=           # gerado pelo artisan (ver abaixo)
```

### 2. Suba os serviços

```bash
docker-compose up -d
```

Os serviços disponíveis após a inicialização:

| Serviço | URL |
|---|---|
| Frontend (Next.js) | http://localhost:3000 |
| Backend (Laravel API) | http://localhost:8000 |
| Elasticsearch | http://localhost:9200 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

### 3. Configure o Laravel

```bash
# Gerar APP_KEY
docker-compose exec backend php artisan key:generate

# Rodar as migrations
docker-compose exec backend php artisan migrate

# Popular o banco com dados iniciais
docker-compose exec backend php artisan db:seed
```

---

## Variáveis de Ambiente obrigatórias

| Variável | Descrição |
|---|---|
| `APP_KEY` | Chave de criptografia do Laravel (gerada pelo `artisan key:generate`) |
| `GEMINI_API_KEY` | Chave da API do Google Gemini (console.cloud.google.com) |
| `NEWSAPI_KEY` | Chave da NewsAPI (newsapi.org) |
| `DB_PASSWORD` | Senha do PostgreSQL (padrão: `newspassword`) |

---

## Comandos úteis

### Backend (Laravel)

```bash
# Executar migrations
docker-compose exec backend php artisan migrate

# Popular o banco
docker-compose exec backend php artisan db:seed

# Disparar coleta manual de notícias (todas as fontes)
docker-compose exec backend php artisan news:fetch

# Filtrar por categoria
docker-compose exec backend php artisan news:fetch --category=inteligencia-artificial

# Processar filas manualmente
docker-compose exec backend php artisan queue:work

# Rodar testes
docker-compose exec backend php artisan test
```

### Frontend (Next.js)

```bash
# Instalar dependências (fora do Docker)
cd frontend && npm install

# Rodar em modo desenvolvimento
cd frontend && npm run dev

# Build de produção
cd frontend && npm run build
```

---

## Estrutura do projeto

```
Blog/
├── backend/                     # Laravel 11 API
│   ├── app/
│   │   ├── Console/Commands/    # FetchAllNewsCommand
│   │   ├── Http/Controllers/Api/# ArticleController, CategoryController
│   │   ├── Jobs/                # FetchNewsJob, GenerateArticleJob
│   │   ├── Models/              # Article, Category, Source, Tag, ...
│   │   └── Services/
│   │       ├── AI/              # AIService, GeminiProvider, interface
│   │       └── NewsSources/     # NewsApiSource, JikanSource, interface
│   ├── config/ai.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
├── frontend/                    # Next.js 14 App Router
│   └── src/
│       ├── app/                 # Páginas (home, artigo, categoria, busca)
│       ├── components/
│       │   ├── articles/        # ArticleCard, HeroArticle
│       │   └── layout/          # Navbar, TrendingStrip, Footer
│       ├── services/api.ts
│       └── types/index.ts
├── infrastructure/
│   └── elasticsearch/config/
├── docs/
│   └── architecture.md
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Fluxo de publicação

1. `news:fetch` coleta dados de fontes externas (NewsAPI, Jikan, RSS)
2. `FetchNewsJob` normaliza os dados e cria um `AutomationRun`
3. `GenerateArticleJob` usa o `AIService` (Gemini por padrão) para gerar o artigo
4. O artigo fica com `status=review` aguardando aprovação manual
5. O editor aprova via painel admin → `status=published`
6. O artigo é indexado no Elasticsearch e exibido no blog

---

## Decisões de arquitetura

- **Revisão manual no MVP:** toda geração de IA passa por aprovação antes de publicar.
- **Gemini 2.0 Flash:** escolhido pela relação custo/benefício (≈ $0,075/1M tokens de entrada).
- **Limite diário:** `AI_MAX_ARTICLES_PER_DAY=3` para controlar custos.
- **Deduplicação:** `content_hash` (md5 do título + conteúdo) evita artigos duplicados.
- **PostgreSQL como fonte oficial:** o Elasticsearch é um índice derivado e reconstruível.
- **ISR no Next.js:** `revalidate = 300` revalida as páginas a cada 5 minutos sem rebuild.

---

## Arquivos que precisam de atenção manual

- `backend/.env` — copiar de `.env.example` e preencher as chaves
- `backend/bootstrap/app.php` — gerado pelo `laravel new` ou copiado do template Laravel 11
- `backend/config/app.php`, `config/services.php` — configurações padrão do Laravel
- `backend/public/index.php` — ponto de entrada HTTP do Laravel
- `backend/artisan` — CLI do Laravel
- `App\Services\AI\OpenAIProvider` — classe não implementada (fallback para Gemini)
- `frontend/package-lock.json` — gerado pelo `npm install`
