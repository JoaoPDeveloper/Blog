<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\FetchNewsJob;
use App\Models\Article;
use App\Models\AutomationRun;
use App\Models\Source;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Dispara a coleta de notícias via HTTP.
     * Protegido por token de admin (ADMIN_TOKEN no .env).
     */
    public function fetchNews(Request $request): JsonResponse
    {
        $token = $request->header('X-Admin-Token')
            ?? $request->query('token');

        $expectedToken = config('services.admin_token');

        if (empty($expectedToken) || $token !== $expectedToken) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $sources = Source::where('is_active', true)->get();

        if ($sources->isEmpty()) {
            return response()->json(['message' => 'Nenhuma fonte ativa.', 'dispatched' => 0]);
        }

        // Rodar em background para não bloquear o request HTTP (proxy timeout)
        $artisan = base_path('artisan');
        exec("php {$artisan} news:fetch > /dev/null 2>&1 &");

        return response()->json([
            'message'  => 'Coleta iniciada em background.',
            'sources'  => $sources->count(),
            'tip'      => 'Aguarde ~2 minutos e verifique /api/v1/articles para os novos artigos.',
        ]);
    }

    /**
     * Status geral do sistema.
     */
    public function status(Request $request): JsonResponse
    {
        $token = $request->header('X-Admin-Token')
            ?? $request->query('token');

        $expectedToken = config('services.admin_token');

        if (empty($expectedToken) || $token !== $expectedToken) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json([
            'articles'       => Article::count(),
            'published'      => Article::where('status', 'published')->count(),
            'ai_generated'   => Article::whereNotNull('ai_provider')->count(),
            'sources_active' => Source::where('is_active', true)->count(),
            'last_run'       => AutomationRun::latest()->first()?->only(['job_type', 'status', 'started_at', 'items_succeeded']),
        ]);
    }
}
