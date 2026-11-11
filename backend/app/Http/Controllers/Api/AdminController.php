<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\FetchNewsJob;
use App\Models\Article;
use App\Models\AutomationRun;
use App\Models\Source;
use App\Support\SecretRedactor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    /**
     * Dispara a coleta de notícias via HTTP.
     * Protegido por token de admin (ADMIN_TOKEN no .env).
     */
    public function fetchNews(Request $request): JsonResponse
    {
        if (!$this->isAuthorized($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $sources = Source::where('is_active', true)->get();

        if ($sources->isEmpty()) {
            return response()->json(['message' => 'Nenhuma fonte ativa.', 'dispatched' => 0]);
        }

        // Os jobs rodam depois que a resposta é enviada (fastcgi_finish_request), então o request
        // retorna rápido (proxy timeout) e os logs saem no stderr do worker FPM (visíveis no Railway).
        set_time_limit(0);
        ignore_user_abort(true);

        // Um único callback pós-resposta (equivalente a dispatchAfterResponse por fonte), com try/catch
        // por fonte: Application::terminate() não isola exceções e uma falha abortaria as demais fontes.
        $sourceIds = $sources->pluck('id')->all();
        app()->terminating(function () use ($sourceIds) {
            foreach ($sourceIds as $sourceId) {
                try {
                    FetchNewsJob::dispatchSync($sourceId);
                } catch (\Throwable $e) {
                    Log::error("AdminController: falha na coleta da fonte {$sourceId}", [
                        'error' => SecretRedactor::redact($e->getMessage()),
                    ]);
                }
            }
        });

        return response()->json([
            'message'      => 'Coleta iniciada em background.',
            'sources'      => $sources->count(),
            'source_names' => $sources->pluck('name')->all(),
            'tip'          => 'Aguarde ~2 minutos e consulte /api/v1/admin/status (last_runs) e /api/v1/articles.',
        ]);
    }

    /**
     * Status geral do sistema.
     */
    public function status(Request $request): JsonResponse
    {
        if (!$this->isAuthorized($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $logChannel = config('logging.default');

        return response()->json([
            'articles'          => Article::count(),
            'published'         => Article::where('status', 'published')->count(),
            'ai_generated'      => Article::whereNotNull('ai_provider')->count(),
            'sources_active'    => Source::where('is_active', true)->count(),
            'last_run'          => AutomationRun::latest()->first()?->only(['job_type', 'status', 'started_at', 'items_succeeded']),
            'server_time'       => [
                'utc' => now()->setTimezone('UTC')->toIso8601String(),
                'app' => now()->toIso8601String(), // timezone da app (config app.timezone)
            ],
            'last_runs'         => AutomationRun::latest('id')->limit(5)->get([
                'id', 'source_id', 'job_type', 'status', 'started_at', 'finished_at',
                'items_processed', 'items_succeeded', 'error_summary',
            ])->each(function (AutomationRun $run) {
                // Linhas antigas podem ter sido gravadas com a mensagem crua (URL com a chave na query)
                if ($run->error_summary !== null) {
                    $run->error_summary = SecretRedactor::redact($run->error_summary);
                }
            }),
            'ai_articles_today' => Article::whereDate('created_at', today())->whereNotNull('ai_provider')->count(),
            // Somente valores não secretos — nunca chaves, senhas ou URLs de conexão.
            'config'            => [
                'app_env'                 => config('app.env'),
                'app_timezone'            => config('app.timezone'),
                'cache_store'             => config('cache.default'),
                'queue_connection'        => config('queue.default'),
                'log_level'               => config("logging.channels.{$logChannel}.level", config('logging.channels.single.level')),
                'gemini_model'            => config('services.gemini.model'),
                'gemini_key_set'          => !empty(config('services.gemini.key')),
                'newsapi_key_set'         => !empty(config('services.newsapi.key')),
                'ai_max_articles_per_day' => (int) config('services.ai.max_articles_per_day'),
            ],
        ]);
    }

    /**
     * Valida o token de admin (header X-Admin-Token ou ?token=). Sem ADMIN_TOKEN configurado, nega sempre.
     */
    private function isAuthorized(Request $request): bool
    {
        $expectedToken = (string) config('services.admin_token');

        if ($expectedToken === '') {
            return false;
        }

        $token = $request->header('X-Admin-Token')
            ?? $request->query('token');

        return is_string($token) && hash_equals($expectedToken, $token);
    }
}
