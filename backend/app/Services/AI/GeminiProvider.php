<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;

class GeminiProvider implements AIProviderInterface
{
    private string $apiKey;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key', '');
        $this->model  = config('services.gemini.model', 'gemini-2.0-flash');
    }

    public function generateArticle(array $sourceData): array
    {
        $category = $sourceData['category'] ?? 'Tecnologia';
        $sources  = $sourceData['sources'] ?? [];

        $sourcesText = collect($sources)->map(function ($s) {
            return "- Título: {$s['title']}\n  URL: {$s['url']}\n  Descrição: {$s['description']}";
        })->implode("\n");

        $prompt = <<<PROMPT
Você é um jornalista especializado em {$category}. Com base nas informações abaixo, escreva um artigo original em português brasileiro.

FONTES:
{$sourcesText}

REGRAS:
- Não copie trechos das fontes; produza texto editorial próprio.
- Não invente fatos, datas, citações ou declarações que não estejam nas fontes.
- O artigo deve ter entre 300 e 600 palavras.
- Use linguagem clara, objetiva e acessível ao público geral.

Responda SOMENTE com um JSON válido no seguinte formato:
{
  "title": "Título do artigo",
  "summary": "Resumo em até duas frases.",
  "content": "Corpo completo do artigo em HTML simples (use <p>, <strong>, <em>).",
  "tags": ["tag1", "tag2", "tag3"]
}
PROMPT;

        $response = Http::post(
            "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}",
            [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
            ]
        );

        $text = $response->json('candidates.0.content.parts.0.text', '{}');

        // Strip markdown code fences if present
        $text = preg_replace('/^```json\s*/i', '', trim($text));
        $text = preg_replace('/```\s*$/', '', $text);

        return json_decode(trim($text), true) ?? [];
    }

    public function estimateCost(int $inputTokens, int $outputTokens): float
    {
        // Gemini 2.0 Flash pricing: $0.075 / 1M input tokens, $0.30 / 1M output tokens
        return ($inputTokens / 1_000_000) * 0.075 + ($outputTokens / 1_000_000) * 0.30;
    }

    public function getProviderName(): string
    {
        return 'gemini';
    }
}
