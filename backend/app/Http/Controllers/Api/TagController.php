<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    /**
     * Hashtags mais usadas em artigos publicados.
     * limit: 1 a 30 (padrão 12). days: opcional; sem ele conta todo o histórico.
     */
    public function trending(Request $request): JsonResponse
    {
        $limit = min(max($request->integer('limit', 12), 1), 30);
        // Teto de 10 anos só para a data não estourar com valores absurdos
        $days  = $request->filled('days') ? min(max($request->integer('days'), 1), 3650) : null;

        $published = function ($query) use ($days) {
            $query->where('articles.status', 'published');
            if ($days !== null) {
                $query->where('articles.published_at', '>=', now()->subDays($days));
            }
        };

        $tags = Tag::query()
            ->select('tags.id', 'tags.name', 'tags.slug')
            ->whereHas('articles', $published)
            ->withCount(['articles' => $published])
            ->orderByDesc('articles_count')
            ->orderBy('tags.name')
            ->limit($limit)
            ->get();

        return response()->json($tags)->header('Cache-Control', 'public, max-age=300, stale-while-revalidate=120');
    }
}
