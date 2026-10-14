<?php

namespace App\Jobs;

use App\Models\Article;
use App\Models\ArticleSource;
use App\Models\AutomationRun;
use App\Models\Category;
use App\Services\AI\AIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GenerateArticleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public function __construct(
        private array $sourceItem,
        private int $categoryId,
        private ?int $sourceId = null,
        private ?int $runId = null
    ) {}

    public function handle(AIService $ai): void
    {
        // Verificar limite diário de artigos gerados por IA
        $maxArticles = (int) config('services.ai.max_articles_per_day', 3);
        $todayCount = Article::whereDate('created_at', today())
            ->whereNotNull('ai_provider')
            ->count();

        if ($todayCount >= $maxArticles) {
            Log::info("GenerateArticleJob: limite diário de {$maxArticles} artigos atingido.");
            return;
        }

        $category = Category::find($this->categoryId);
        $categoryName = $category?->name ?? 'Tecnologia';

        Log::info("GenerateArticleJob: gerando artigo para categoria '{$categoryName}'", [
            'source_title' => $this->sourceItem['title'] ?? '',
        ]);

        $result = $ai->generateArticle([
            'category' => $categoryName,
            'sources'  => [$this->sourceItem],
        ]);

        if (empty($result['title']) || empty($result['content'])) {
            Log::error('GenerateArticleJob: conteúdo inválido retornado pela IA.', ['result' => $result]);
            return;
        }

        // Deduplicação por hash do conteúdo
        $contentHash = md5($result['title'] . $result['content']);
        if (Article::where('content_hash', $contentHash)->exists()) {
            Log::info("GenerateArticleJob: artigo duplicado, ignorando.", ['hash' => $contentHash]);
            return;
        }

        // Criar artigo — status 'published' para o MVP (fase de testes)
        // Trocar para 'review' quando ativar aprovação manual
        $article = Article::create([
            'category_id'           => $this->categoryId,
            'title'                 => $result['title'],
            'slug'                  => Str::slug($result['title']) . '-' . Str::random(5),
            'summary'               => $result['summary'] ?? null,
            'content'               => $result['content'],
            'image_url'             => $this->sourceItem['image_url'] ?? null,
            'status'                => 'published',
            'review_status'         => 'approved',
            'language'              => 'pt',
            'published_at'          => now(),
            'ai_provider'           => $result['ai_provider'] ?? null,
            'ai_model'              => $result['ai_model'] ?? null,
            'content_hash'          => $contentHash,
            'original_published_at' => $this->sourceItem['published_at'] ?? null,
        ]);

        // Salvar fonte original do artigo
        ArticleSource::create([
            'article_id'        => $article->id,
            'source_id'         => $this->sourceId,
            'source_url'        => $this->sourceItem['url'] ?? '',
            'source_title'      => $this->sourceItem['title'] ?? null,
            'source_published_at' => $this->sourceItem['published_at'] ?? null,
            'retrieved_at'      => now(),
        ]);

        // Salvar tags geradas pela IA
        if (!empty($result['tags'])) {
            $tagIds = [];
            foreach ($result['tags'] as $tagName) {
                $tag = \App\Models\Tag::firstOrCreate(
                    ['slug' => Str::slug($tagName)],
                    ['name' => $tagName]
                );
                $tagIds[] = $tag->id;
            }
            $article->tags()->sync($tagIds);
        }

        if ($this->runId) {
            AutomationRun::where('id', $this->runId)->increment('items_succeeded');
        }

        Log::info("GenerateArticleJob: artigo publicado.", [
            'id'    => $article->id,
            'title' => $article->title,
        ]);
    }
}
