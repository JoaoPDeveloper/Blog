<?php

namespace App\Jobs;

use App\Models\Article;
use App\Models\AutomationRun;
use App\Models\Category;
use App\Services\AI\AIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class GenerateArticleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public function __construct(
        private array $sourceItem,
        private int $categoryId,
        private ?int $runId = null
    ) {
    }

    public function handle(AIService $ai): void
    {
        $maxArticles = (int) config('services.ai.max_articles_per_day', 3);

        $todayCount = Article::whereDate('created_at', today())
            ->whereNotNull('ai_provider')
            ->count();

        if ($todayCount >= $maxArticles) {
            return;
        }

        $category = Category::find($this->categoryId);
        $categoryName = $category?->name ?? 'Tecnologia';

        $result = $ai->generateArticle([
            'category' => $categoryName,
            'sources'  => [$this->sourceItem],
        ]);

        if (empty($result['title']) || empty($result['content'])) {
            return;
        }

        $contentHash = md5($result['title'] . $result['content']);

        if (Article::where('content_hash', $contentHash)->exists()) {
            return;
        }

        Article::create([
            'category_id'          => $this->categoryId,
            'title'                => $result['title'],
            'slug'                 => Str::slug($result['title']) . '-' . Str::random(6),
            'summary'              => $result['summary'] ?? null,
            'content'              => $result['content'],
            'status'               => 'review',
            'review_status'        => 'pending',
            'language'             => 'pt',
            'ai_provider'          => $result['ai_provider'] ?? null,
            'ai_model'             => $result['ai_model'] ?? null,
            'content_hash'         => $contentHash,
            'original_published_at' => $this->sourceItem['published_at'] ?? null,
        ]);

        if ($this->runId) {
            AutomationRun::where('id', $this->runId)->increment('items_succeeded');
        }
    }
}
