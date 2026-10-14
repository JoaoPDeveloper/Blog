<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiProvider implements AIProviderInterface
{
    private string $apiKey;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key', '');
        $this->model  = config('services.gemini.model', 'gemini-3.8-flash');
    }

    public function generateArticle(array $sourceData): array
    {
        if (empty($this->apiKey)) {
            Log::error('GeminiProvider: GEMINI_API_KEY não configurada em backend/.env');
            return [];
        }

        $category    = $sourceData['category'] ?? 'Tecnologia';
        $sources     = $sourceData['sources'] ?? [];

        $sourcesText = collect($sources)->map(fn($s) =>
            "Título: {$s['title']}\nURL: {$s['url']}\nDescrição: {$s['description']}"
        )->implode("\n\n");

        $prompt = <<<PROMPT
Você é um jornalista especializado em {$category}. Com base nas informações abaixo, escreva um artigo original em português brasileiro.

FONTES:
{$sourcesText}

REGRAS:
- Produza texto editorial próprio — não copie as fontes.
- Não invente fatos, datas ou declarações ausentes nas fontes.
- O artigo deve ter entre 300 e 600 palavras.
- Linguagem clara e acessível ao público geral.
- Ao final do conteúdo, cite a fonte original.

Responda SOMENTE com JSON válido neste formato (sem markdown, sem ```, só o JSON):
{"title":"Título do artigo","summary":"Resumo em até duas frases.","content":"Corpo completo em HTML simples (use <p>, <strong>, <em>). Inclua no final um parágrafo com a fonte original.","tags":["tag1","tag2","tag3"]}
PROMPT;

        Log::info('GeminiProvider: chamando API', ['model' => $this->model, 'category' => $category]);

        $response = Http::withoutVerifying() // SSL: instalar ca-certificates no Dockerfile para produção
            ->timeout(30)
            ->retry(3, 5000, fn($e, $req) => true) // 3 tentativas, 5s de espera
            ->post(
                "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}",
                [
                    'contents' => [[
                        'parts' => [['text' => $prompt]],
                    ]],
                    'generationConfig' => [
                        'temperature'     => 0.7,
                        'maxOutputTokens' => 2048,
                    ],
                ]
            );

        if (!$response->successful()) {
            Log::error('GeminiProvider: erro HTTP', [
                'status' => $response->status(),
                'body'   => substr($response->body(), 0, 500),
            ]);
            return [];
        }

        $text = $response->json('candidates.0.content.parts.0.text', '');

        if (empty($text)) {
            Log::error('GeminiProvider: resposta sem texto', [
                'body' => substr($response->body(), 0, 500),
            ]);
            return [];
        }

        // Limpar possíveis blocos markdown da resposta
        $text = preg_replace('/^```json\s*/i', '', trim($text));
        $text = preg_replace('/^```\s*/i', '', $text);
        $text = preg_replace('/```\s*$/i', '', $text);
        $text = trim($text);

        $decoded = json_decode($text, true);

        if (!$decoded || empty($decoded['title']) || empty($decoded['content'])) {
            Log::error('GeminiProvider: JSON inválido ou campos ausentes', [
                'raw' => substr($text, 0, 300),
            ]);
            return [];
        }

        Log::info('GeminiProvider: artigo gerado com sucesso', ['title' => $decoded['title']]);

        return $decoded;
    }

    public function estimateCost(int $inputTokens, int $outputTokens): float
    {
        // Gemini 2.0 Flash: $0.075/1M input, $0.30/1M output
        return ($inputTokens / 1_000_000) * 0.075 + ($outputTokens / 1_000_000) * 0.30;
    }

    public function getProviderName(): string
    {
        return 'gemini';
    }
}
