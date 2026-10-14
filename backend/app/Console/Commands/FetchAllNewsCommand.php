<?php

namespace App\Console\Commands;

use App\Jobs\FetchNewsJob;
use App\Models\Category;
use App\Models\Source;
use Illuminate\Console\Command;

class FetchAllNewsCommand extends Command
{
    protected $signature = 'news:fetch {--category= : ID ou slug da categoria}';
    protected $description = 'Coleta notícias de todas as fontes ativas e gera artigos com IA';

    public function handle(): int
    {
        $query = Source::where('is_active', true);

        if ($categoryFilter = $this->option('category')) {
            // Aceita ID numérico ou slug
            if (is_numeric($categoryFilter)) {
                $query->where('category_id', $categoryFilter);
            } else {
                $category = Category::where('slug', $categoryFilter)->first();
                if (!$category) {
                    $this->error("Categoria '{$categoryFilter}' não encontrada.");
                    return self::FAILURE;
                }
                $query->where('category_id', $category->id);
            }
        }

        $sources = $query->get();

        if ($sources->isEmpty()) {
            $this->warn('Nenhuma fonte ativa encontrada.');
            return self::SUCCESS;
        }

        $ok    = 0;
        $erros = 0;

        foreach ($sources as $source) {
            try {
                // Com QUEUE_CONNECTION=sync, o job roda imediatamente aqui
                FetchNewsJob::dispatch($source->id);
                $this->info("✓ {$source->name}");
                $ok++;
            } catch (\Throwable $e) {
                $this->error("✗ {$source->name}: " . $e->getMessage());
                $erros++;
            }
        }

        $this->newLine();
        $this->info("Concluído: {$ok} fonte(s) processada(s), {$erros} com erro.");

        return $erros > 0 ? self::FAILURE : self::SUCCESS;
    }
}
