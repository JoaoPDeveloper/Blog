<?php

namespace App\Services\NewsSources;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NewsApiSource implements NewsSourceInterface
{
    public function fetch(array $config): array
    {
        $apiKey = config('services.newsapi.key');

        if (empty($apiKey)) {
            Log::warning('NewsApiSource: NEWSAPI_KEY not configured.');
            return [];
        }

        $response = Http::get('https://newsapi.org/v2/everything', [
            'q'        => $config['query'] ?? '',
            'language' => $config['language'] ?? 'pt',
            'sortBy'   => 'publishedAt',
            'pageSize' => $config['pageSize'] ?? 5,
            'apiKey'   => $apiKey,
        ]);

        $articles = $response->json('articles', []);

        return array_map(fn ($item) => $this->normalize($item), $articles);
    }

    public function normalize(array $raw): array
    {
        return [
            'title'        => $raw['title'] ?? '',
            'url'          => $raw['url'] ?? '',
            'description'  => $raw['description'] ?? '',
            'published_at' => $raw['publishedAt'] ?? null,
            'source_name'  => $raw['source']['name'] ?? '',
        ];
    }

    public function getSourceType(): string
    {
        return 'newsapi';
    }
}
