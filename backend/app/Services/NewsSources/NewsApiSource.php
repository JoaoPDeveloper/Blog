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
            Log::warning('NewsApiSource: NEWSAPI_KEY não configurada. Adicione em backend/.env');
            return [];
        }

        // NewsAPI free tier tem muito mais conteúdo em inglês.
        // A IA vai gerar o artigo em PT-BR independente do idioma da fonte.
        $language = $config['language'] ?? 'en';
        $query    = $config['query'] ?? 'artificial intelligence';

        Log::info("NewsApiSource: buscando '{$query}' em idioma '{$language}'");

        $response = Http::timeout(15)
            ->withoutVerifying() // SSL cert issue em Docker dev — remover em produção
            ->get('https://newsapi.org/v2/everything', [
            'q'        => $query,
            'language' => $language,
            'sortBy'   => 'publishedAt',
            'pageSize' => $config['pageSize'] ?? 5,
            'apiKey'   => $apiKey,
        ]);

        if (!$response->successful()) {
            Log::error('NewsApiSource: erro na resposta', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return [];
        }

        $articles = $response->json('articles', []);

        // Filtrar artigos sem conteúdo útil
        $articles = array_filter($articles, fn($a) =>
            !empty($a['title']) &&
            $a['title'] !== '[Removed]' &&
            !empty($a['description'])
        );

        Log::info("NewsApiSource: retornou " . count($articles) . " artigos válidos.");

        return array_values(array_map(fn($item) => $this->normalize($item), $articles));
    }

    public function normalize(array $raw): array
    {
        return [
            'title'        => $raw['title'] ?? '',
            'url'          => $raw['url'] ?? '',
            'description'  => $raw['description'] ?? '',
            'content'      => $raw['content'] ?? '',
            'published_at' => $raw['publishedAt'] ?? null,
            'source_name'  => $raw['source']['name'] ?? '',
            'image_url'    => $raw['urlToImage'] ?? null,
        ];
    }

    public function getSourceType(): string
    {
        return 'newsapi';
    }
}
