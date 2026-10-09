<?php

namespace App\Console\Commands;

use App\Jobs\FetchNewsJob;
use App\Models\Category;
use App\Models\Source;
use Illuminate\Console\Command;

class FetchAllNewsCommand extends Command
{
    protected $signature = 'news:fetch {--category= : Slug da categoria para filtrar as fontes}';

    protected $description = 'Dispara FetchNewsJob para cada fonte ativa, com filtro opcional por categoria.';

    public function handle(): int
    {
        $query = Source::where('is_active', true);

        if ($categorySlug = $this->option('category')) {
            $category = Category::where('slug', $categorySlug)->first();

            if (! $category) {
                $this->error("Categoria '{$categorySlug}' não encontrada.");
                return self::FAILURE;
            }

            $query->where('category_id', $category->id);
        }

        $sources = $query->get();

        if ($sources->isEmpty()) {
            $this->warn('Nenhuma fonte ativa encontrada.');
            return self::SUCCESS;
        }

        foreach ($sources as $source) {
            FetchNewsJob::dispatch($source->id);
            $this->info("Job despachado para a fonte: {$source->name}");
        }

        $this->info("Total: {$sources->count()} job(s) despachados.");

        return self::SUCCESS;
    }
}
