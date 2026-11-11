# Operação da coleta de notícias

Guia curto para disparar, acompanhar e agendar a coleta de notícias do backend (Railway).
Todas as chamadas abaixo exigem o header `X-Admin-Token` com o valor da variável `ADMIN_TOKEN`
configurada no Railway (o valor não fica neste documento). Se `ADMIN_TOKEN` estiver vazio, a API responde sempre 401.

## 1. Disparar a coleta manualmente

```bash
curl -X POST "https://blog-production-3c38.up.railway.app/api/v1/admin/fetch-news" \
  -H "X-Admin-Token: <ADMIN_TOKEN>"
```

A resposta é imediata (JSON com `sources` e `source_names`). A coleta continua no servidor depois da resposta,
então os logs aparecem no Railway e o resultado pode ser lido no `status` (item 2). Cada fonte gera até 2 artigos,
com pausa de 8 s entre eles, então espere alguns minutos. Cada coleta ocupa um worker do PHP-FPM até terminar; evite
disparos sobrepostos.

Use sempre o header `X-Admin-Token`. A API também aceita `?token=` na URL, mas o nginx registra a URL no access log
(que vai para os logs do Railway), então o token vazaria ali. Não use `?token=` no cron-job.org nem em scripts.

No primeiro disparo em produção, confira `last_runs` no `status` e os logs do Railway para validar que a coleta
rodou depois da resposta.

## 2. Ler o status

```bash
curl "https://blog-production-3c38.up.railway.app/api/v1/admin/status" \
  -H "X-Admin-Token: <ADMIN_TOKEN>"
```

Como interpretar:

- `server_time`: hora do servidor em UTC (`utc`) e no timezone da app (`app`). Útil para conferir se o agendamento está no horário certo.
- `last_runs`: últimas 5 execuções (`AutomationRun`), da mais nova para a mais antiga.
  - `status`: `running`, `completed` ou `failed`. Cada fonte gera até 2 artigos no mesmo run: se um falhar e o outro publicar,
    o run fica `failed` com `items_succeeded` maior que 0 (o `failed` não é revertido).
  - `items_processed`: itens retornados pela fonte; `items_succeeded`: artigos publicados.
  - `error_summary`: motivo curto; quando os dois artigos do run têm motivos diferentes, eles aparecem separados por ` | `.
    Chaves de API são trocadas por `[REDACTED]`. Exemplos:
    - `Limite diário de N artigos de IA atingido`: informativo, o run não é marcado como `failed`.
    - `Artigo duplicado`: informativo, o run não é marcado como `failed`.
    - `IA retornou título/conteúdo vazio`: run `failed`; confira `gemini_key_set`, `gemini_model` e os logs.
    - Mensagem de erro HTTP/conexão: problema com NewsAPI, Jikan ou Gemini.
  - Run `completed` com `items_succeeded` 0 e sem `error_summary` indica que a fonte não trouxe itens.
- `ai_articles_today`: artigos gerados por IA hoje. Se for igual a `config.ai_max_articles_per_day`, o limite diário foi atingido.
- `config`: valores não secretos do ambiente (`app_env`, `app_timezone`, `cache_store`, `queue_connection`, `log_level`,
  `gemini_model`, `ai_max_articles_per_day`) e flags `gemini_key_set` / `newsapi_key_set`. Se uma flag for `false`, a variável
  de ambiente correspondente não está chegando ao app. `queue_connection` precisa ser `sync`: o container não roda
  `queue:work`, então com qualquer outro valor os jobs de geração ficam na fila e nenhum artigo é gerado.

## 3. Gatilho principal: cron-job.org

O scheduler interno (`schedule:run` dentro do container, `news:fetch` às 08:00 e 18:00) só dispara se o container estiver
de pé nesses horários. Por isso o gatilho principal passa a ser externo, e o scheduler interno fica como reserva.

Crie dois jobs em https://cron-job.org:

| Campo | Valor |
| --- | --- |
| URL | `https://blog-production-3c38.up.railway.app/api/v1/admin/fetch-news` |
| Método | `POST` |
| Header | `X-Admin-Token: <ADMIN_TOKEN>` |
| Timezone | `America/Sao_Paulo` |
| Horários | job 1 às 08:00, job 2 às 18:00 |
| Timeout | generoso (60 s ou mais), para absorver latência de rede e reinício do container (deploy) |

Se o backend estiver fora do ar, o cron-job.org mostra o erro no histórico do job (por exemplo 502). Nesse caso o problema é de
infra no Railway (deploy, porta ou healthcheck), não da coleta.

## 4. Logs durante a depuração

Com `LOG_LEVEL=error`, os logs de `info` e `warning` não aparecem. Confira o valor atual em `config.log_level` no `status`
e, enquanto estiver depurando, configure `LOG_LEVEL=info` nas variáveis do Railway (volte para `error` depois).
