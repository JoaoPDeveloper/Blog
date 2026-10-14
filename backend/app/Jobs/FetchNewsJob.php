<?php

namespace App\Jobs;

use App\Models\AutomationRun;
use App\Models\Source;
use App\Services\NewsSources\JikanSource;
use App\Services\NewsSources\NewsApiSource;
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

            $run->update([
                'status'          => 'completed',
                'finished_at'     => now(),
                'items_processed' => count($items),
                'items_succeeded' => 0,
                'metadata'        => ['items_fetched' => count($items)],
            ]);

            $source->update(['last_fetched_at' => now()]);

            // Disparar geração de artigo para o item mais relevante (1 por coleta)
            if (!empty($items)) {
                GenerateArticleJob::dispatch(
                    $items[0],
                    $source->category_id,
                    $source->id,
                    $run->id
                );
            }

        } catch (\Throwable $e) {
            $run->update([
                'status'        => 'failed',
                'finished_at'   => now(),
                'error_summary' => $e->getMessage(),
            ]);
            Log::error("FetchNewsJob: erro em {$source->name}", ['error' => $e->getMessage()]);
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
