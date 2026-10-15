<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->withCount(['articles' => function ($query) {
                $query->where('status', 'published');
            }])
            ->get();

        return response()->json($categories)->header('Cache-Control', 'public, max-age=600, stale-while-revalidate=300');
    }

    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        return response()->json($category);
    }
}
