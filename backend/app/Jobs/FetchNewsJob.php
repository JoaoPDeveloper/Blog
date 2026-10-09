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
use Throwable;

class FetchNewsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $backoff = 60;

    public function __construct(private int $sourceId)
    {
    }

    public function handle(): void
    {
        $source = Source::find($this->sourceId);

        if (! $source || ! $source->is_active) {
            Log::info("FetchNewsJob: source {$this->sourceId} not found or inactive. Skipping.");
            return;
        }

        $run = AutomationRun::create([
            'source_id'  => $source->id,
            'job_type'   => 'fetch_news',
            'status'     => 'running',
            'started_at' => now(),
        ]);

        try {
            $config = $source->configuration ?? [];

            if (isset($config['apiKeyEnv']) && isset($config['query'])) {
                $fetcher = new NewsApiSource();
            } elseif (str_contains($source->base_url, 'jikan')) {
                $fetcher = new JikanSource();
            } else {
                Log::warning("FetchNewsJob: unknown source type for source {$source->id}.");
                $run->update(['status' => 'failed', 'finished_at' => now()]);
                return;
            }

            $items = $fetcher->fetch($config);

            $run->update([
                'status'          => 'completed',
                'finished_at'     => now(),
                'items_processed' => count($items),
                'items_succeeded' => count($items),
                'metadata'        => ['fetched_count' => count($items)],
            ]);

            $source->update(['last_fetched_at' => now()]);

            if (! empty($items)) {
                GenerateArticleJob::dispatch($items[0], $source->category_id, $run->id);
            }
        } catch (Throwable $e) {
            $run->update([
                'status'        => 'failed',
                'finished_at'   => now(),
                'error_summary' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
