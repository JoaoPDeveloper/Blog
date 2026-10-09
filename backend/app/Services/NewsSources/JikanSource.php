<?php

namespace App\Services\NewsSources;

use Illuminate\Support\Facades\Http;

class JikanSource implements NewsSourceInterface
{
    public function fetch(array $config): array
    {
        $response = Http::get('https://api.jikan.moe/v4/top/anime', [
            'type'   => 'tv',
            'filter' => 'airing',
            'limit'  => 5,
        ]);

        $items = $response->json('data', []);

        return array_map(fn ($item) => $this->normalize($item), $items);
    }

    public function normalize(array $raw): array
    {
        return [
            'title'        => $raw['title'] ?? '',
            'url'          => $raw['url'] ?? '',
            'description'  => $raw['synopsis'] ?? '',
            'published_at' => $raw['aired']['from'] ?? null,
            'source_name'  => 'MyAnimeList via Jikan',
        ];
    }

    public function getSourceType(): string
    {
        return 'jikan';
    }
}
