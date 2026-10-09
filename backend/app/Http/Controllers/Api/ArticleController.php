<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ArticleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Article::with(['category', 'tags'])
            ->where('status', 'published');

        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(title) LIKE ?', ['%' . strtolower($search) . '%'])
                  ->orWhereRaw('LOWER(summary) LIKE ?', ['%' . strtolower($search) . '%']);
            });
        }

        $articles = $query->orderByDesc('published_at')
            ->paginate($request->integer('per_page', 12));

        return response()->json($articles);
    }

    public function show(string $slug): JsonResponse
    {
        $article = Article::with(['category', 'tags', 'sources'])
            ->where('status', 'published')
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($article);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title'       => 'required|string|max:255',
            'slug'        => 'required|string|unique:articles,slug',
            'summary'     => 'nullable|string',
            'content'     => 'required|string',
            'status'      => 'required|in:draft,review,published',
            'language'    => 'required|string|max:10',
        ]);

        $article = Article::create($validated);

        return response()->json($article, 201);
    }

    public function update(Request $request, Article $article): JsonResponse
    {
        $validated = $request->validate([
            'category_id'   => 'sometimes|exists:categories,id',
            'title'         => 'sometimes|string|max:255',
            'slug'          => 'sometimes|string|unique:articles,slug,' . $article->id,
            'summary'       => 'sometimes|nullable|string',
            'content'       => 'sometimes|string',
            'status'        => 'sometimes|in:draft,review,published',
            'language'      => 'sometimes|string|max:10',
            'review_status' => 'sometimes|in:pending,approved,rejected',
        ]);

        $article->update($validated);

        return response()->json($article);
    }

    public function destroy(Article $article): JsonResponse
    {
        $article->delete();

        return response()->json(null, 204);
    }
}
