# Performance optimization: native fetch cache, OPcache, artisan caching, Cache-Control headers

This change removes the axios dependency from the Next.js frontend in favour of native `fetch` with `next: { revalidate }` hints, adds ISR route-segment cache exports to three pages, configures OPcache in the PHP Dockerfile, adds `config:cache`/`route:cache` to the entrypoint, and propagates `Cache-Control` headers from the Laravel API controllers. All five required changes are confirmed present and functionally correct.

Watch for: (1 — **confirmed**) the conditional `composer install` checks only `composer.json` timestamp, not `composer.lock`, so a lockfile-only update won't trigger reinstallation; (2 — **confirmed**) `config:cache` and `route:cache` failures are fully silenced via `2>/dev/null || true`, meaning a broken `.env` starts the server without caches and leaves no trace.

**Verdict**: APPROVED

---

## High-level view

The axios client is entirely gone from `api.ts`; every function now calls the platform-native `fetch` with a `next: { revalidate }` option baked in at the call site, which plugs directly into Next.js ISR data caching. The route-segment `revalidate` / `dynamic` exports in the three modified pages work at the ISR layer above the data cache — a complementary, not redundant, layer.

The entrypoint rework correctly positions `config:cache` and `route:cache` after `key:generate` and before `php -S`, eliminating per-request route resolution overhead. The conditional `composer install` meaningfully cuts restart time in development, but its timestamp check is incomplete (see Issues).

OPcache is configured with `validate_timestamps=1` and `revalidate_freq=2`, appropriate for a dev environment where PHP files change under a mounted volume. The Cache-Control headers on the three API endpoints match the frontend revalidate intervals, forming a coherent end-to-end cache budget — with one gap on the search page.

---

<details>
<summary>Issues (4)</summary>

1. **composer.lock not checked in conditional install** — The `[ composer.json -nt vendor/autoload.php ]` condition ignores `composer.lock`. A `composer update` (or any lockfile-only change) silently keeps a stale vendor. Add `|| [ composer.lock -nt vendor/autoload.php ]` to the condition.

2. **config:cache / route:cache failures silently swallowed** — `2>/dev/null || true` suppresses all output from these commands. If either fails (broken .env, missing service binding, etc.), the container starts without the cache and the failure is invisible. Remove the `2>/dev/null` redirect so errors surface in container logs, or at minimum capture exit code separately.

3. **Route segment exports placed mid-import-block** — In `artigo/[slug]/page.tsx` `export const revalidate = 300` sits between `import { notFound }` and `import { getArticle }`. In `busca/page.tsx` `export const dynamic = 'force-dynamic'` sits after the first import line. Both work correctly at runtime (ESM top-level), but this placement confuses static analysis tools and IDE import organizers that expect all imports before any non-import statements.

4. **Search data cached 120 s despite force-dynamic** — `busca/page.tsx` sets `dynamic = 'force-dynamic'` (correct, needed for `searchParams`), but `getArticles` still passes `next: { revalidate: 120 }`, so search results are served from the Next.js data cache for up to 2 minutes. Two users searching the same term within that window get identical results regardless of new articles published between requests. If freshness matters for search, pass `cache: 'no-store'` instead, or add a dedicated `getArticlesNoCache` variant called only from the search page.

</details>

---

<details>
<summary>Details</summary>

### axios removal and fetch rewrite

The old `createApi()` returned a new axios instance on every call — no connection reuse, no built-in Next.js cache integration, and a 10 s timeout wired at the instance level. The replacement `apiFetch<T>` merges caller-supplied `options` over a fixed headers baseline, so the `next: { revalidate }` object from each call site reaches the Next.js fetch instrumentation layer as intended. The query-string builder for `getArticles` manually filters `undefined` values before serialising, reproducing the silent-skip behaviour axios applied to `undefined` params — without this filter, `URLSearchParams` would serialise them as the string `"undefined"`.

No axios import remains anywhere in the frontend tree (confirmed via grep across `frontend/**/*.ts` and `frontend/**/*.tsx`). All five call sites are server components or async server-side code paths; none pass results through a client boundary, so the removal of axios and addition of the `next: { revalidate }` option (a Node.js / Next.js-only extension) introduce no runtime errors in client bundles.

### ISR cache layers and their alignment

```
Browser → CDN/Proxy → Next.js route cache → Next.js data cache → Laravel API → DB
                           ↑                        ↑                   ↑
                   revalidate = N s         next:{revalidate:N}   Cache-Control max-age=N
```

| Endpoint        | fetch revalidate | Route revalidate      | Cache-Control max-age |
|---|---|---|---|
| /articles       | 120 s            | 120 s (categoria)     | 120, swr=60           |
| /articles/:slug | 300 s            | 300 s (artigo)        | 300, swr=120          |
| /categories     | 600 s            | 120 s (categoria)     | 600, swr=300          |

The `categoria` page fetches both categories and articles; `revalidate = 120` is the binding constraint — the tighter article freshness requirement dominates.

The search page is the only alignment gap: the route is fully dynamic (per-request render) but the underlying data fetch is still cached 120 s (Issue 4). A `force-dynamic` route re-renders on every request but still serves the data cache hit, so users get per-request renders of 2-minute-old data.

### Entrypoint sequencing and gaps

The new startup sequence:

```
1. .env existence check
2. Conditional composer install (vendor absent OR composer.json newer than vendor/autoload.php)
3. Clear bootstrap/cache/{services,packages,config}.php
4. key:generate  (if APP_KEY empty)
5. config:cache
6. route:cache
7. exec php -S 0.0.0.0:8000 server.php
```

The `composer.lock` gap (Issue 1): the condition `[ composer.json -nt vendor/autoload.php ]` evaluates false when only `composer.lock` has changed (e.g., `composer update` adds a minor version bump). The new lockfile is ignored, `vendor/` remains stale, and the discrepancy is invisible until something breaks at runtime or `vendor/` is manually deleted.

The silent-failure risk (Issue 2): both cache commands are `cmd --quiet 2>/dev/null || true`. If Laravel can't bootstrap its kernel — a missing queue connection, a malformed .env value — `config:cache` exits non-zero, `bootstrap/cache/config.php` is never written, and the server starts on the slow per-request config path with no log entry. Removing `2>/dev/null` preserves the `|| true` safety net (so the container still starts) while letting the failure message reach `docker logs`.

### OPcache configuration

`validate_timestamps=1` with `revalidate_freq=2` means PHP checks file mtimes every 2 seconds, which is correct for a development volume mount where code changes need to be picked up without a container restart. For a production image (where code is baked in and immutable), these should be flipped to `validate_timestamps=0` — not relevant here but worth noting if the same Dockerfile is ever used as a production base.

</details>

---

<details>
<summary>File map</summary>

| File | Change |
|---|---|
| `frontend/src/services/api.ts` | Removed axios; rewrote with native fetch + `next:{revalidate}` per endpoint |
| `frontend/src/app/categoria/[slug]/page.tsx` | Added `export const revalidate = 120` |
| `frontend/src/app/artigo/[slug]/page.tsx` | Added `export const revalidate = 300` (placed mid-import-block) |
| `frontend/src/app/busca/page.tsx` | Added `export const dynamic = 'force-dynamic'` (placed mid-import-block) |
| `backend/Dockerfile` | Added OPcache ini block after `docker-php-ext-install` |
| `backend/docker-entrypoint.sh` | Conditional composer install; added `config:cache`/`route:cache` after `key:generate` |
| `backend/app/Http/Controllers/Api/ArticleController.php` | Added Cache-Control headers to `index()` and `show()` |
| `backend/app/Http/Controllers/Api/CategoryController.php` | Added Cache-Control header to `index()` |

Full diff: `git diff be12a94 HEAD`

</details>
