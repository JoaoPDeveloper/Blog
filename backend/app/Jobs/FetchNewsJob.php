<?php

namespace App\Jobs;

use App\Models\AutomationRun;
use App\Models\Source;
use App\Services\NewsSources\JikanSource;
use App\Services\NewsSources\NewsApiSource;
use App\Support\SecretRedactor;
use App\Support\SourceUrl;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FetchNewsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $backoff = 60;

    public function __construct(private int $sourceId) {}

    public function handle(): void
    {
        $source = Source::find($this->sourceId);

        if (!$source || !$source->is_active) {
            return;
        }

        $run = AutomationRun::create([
            'source_id'  => $source->id,
            'job_type'   => 'fetch_news',
            'status'     => 'running',
            'started_at' => now(),
        ]);

        try {
            $config  = $source->configuration ?? [];
            $fetcher = $this->resolveFetcher($source, $config);

            if (!$fetcher) {
                Log::warning("FetchNewsJob: tipo de fonte desconhecido para source {$source->id}.");
                $run->update(['status' => 'failed', 'finished_at' => now(), 'error_summary' => 'Tipo de fonte não suportado.']);
                return;
            }

            $items = $fetcher->fetch($config);
            Log::info("FetchNewsJob: {$source->name} retornou " . count($items) . " itens.");

            // Descartar notícias cuja URL já virou artigo (com 3 coletas por dia o topo da NewsAPI se repete).
            // Itens sem URL não são descartados por este critério.
            $usedUrls = SourceUrl::alreadyUsed(array_column($items, 'url'));
            $newItems = array_values(array_filter($items, function ($item) use ($usedUrls) {
                $url = SourceUrl::normalize($item['url'] ?? '');
                return $url === '' || !in_array($url, $usedUrls, true);
            }));
            $alreadyUsed = count($items) - count($newItems);

            $runValues = [
                'status'          => 'completed',
                'finished_at'     => now(),
                'items_processed' => count($items),
                'items_succeeded' => 0,
                'metadata'        => ['items_fetched' => count($items), 'items_already_used' => $alreadyUsed],
            ];
            if ($alreadyUsed > 0 && !$newItems) {
                // Informativo: o run continua 'completed'
                $runValues['error_summary'] = 'Nenhum item novo: todas as notícias já foram usadas.';
                Log::info("FetchNewsJob: {$source->name} sem itens novos ({$alreadyUsed} já usados).");
            }
            $run->update($runValues);

            $source->update(['last_fetched_at' => now()]);

            // Gerar até 2 artigos por fonte com pausa entre eles (evitar rate limit do Gemini)
            $maxPerSource = 2;
            foreach (array_slice($newItems, 0, $maxPerSource) as $index => $item) {
                if ($index > 0) {
                    sleep(8); // 8s entre chamadas (free tier Gemini: ~10 RPM)
                }
                GenerateArticleJob::dispatch(
                    $item,
                    $source->category_id,
                    $source->id,
                    $run->id
                );
            }

        } catch (\Throwable $e) {
            // A mensagem pode conter a URL com a chave de API na query — sanitizar antes de gravar/logar
            $message = SecretRedactor::redact($e->getMessage());
            $run->update([
                'status'        => 'failed',
                'finished_at'   => now(),
                'error_summary' => $message,
            ]);
            Log::error("FetchNewsJob: erro em {$source->name}", ['error' => $message]);
            // Não re-throw — deixa o comando continuar para as próximas fontes
        }
    }

    private function resolveFetcher(Source $source, array $config)
    {
        if (isset($config['apiKeyEnv']) || isset($config['query'])) {
            return new NewsApiSource();
        }
        if (str_contains($source->base_url, 'jikan')) {
            return new JikanSource();
        }
        return null;
    }
}
