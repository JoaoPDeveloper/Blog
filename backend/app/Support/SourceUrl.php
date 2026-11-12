<?php

namespace App\Support;

use App\Models\ArticleSource;

class SourceUrl
{
    /**
     * Normaliza a URL de uma fonte para comparação: sem espaços nas pontas e sem fragmento (#...).
     */
    public static function normalize(?string $url): string
    {
        $url = trim((string) $url);

        $hash = strpos($url, '#');
        if ($hash !== false) {
            $url = trim(substr($url, 0, $hash));
        }

        return $url;
    }

    /**
     * Dentre as URLs informadas, devolve (normalizadas) as que já existem em article_sources.source_url.
     * URLs vazias são ignoradas.
     *
     * @param  array<int, mixed>  $urls
     * @return array<int, string>
     */
    public static function alreadyUsed(array $urls): array
    {
        $candidates = [];
        foreach ($urls as $url) {
            $normalized = self::normalize($url);
            if ($normalized === '') {
                continue;
            }
            // source_url é gravado como veio da fonte; procurar a forma original e a normalizada
            $candidates[] = $normalized;
            $candidates[] = (string) $url;
        }

        if (!$candidates) {
            return [];
        }

        return ArticleSource::whereIn('source_url', array_values(array_unique($candidates)))
            ->pluck('source_url')
            ->map(fn ($stored) => self::normalize($stored))
            ->unique()
            ->values()
            ->all();
    }
}
