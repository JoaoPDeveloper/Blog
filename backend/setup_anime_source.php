<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Source;

// Ativar NewsAPI para Animes (usando queries em inglês que a IA traduz para PT-BR)
$existing = Source::where('name', 'NewsAPI — Animes')->first();
if ($existing) {
    $existing->update([
        'is_active'     => true,
        'configuration' => [
            'query'     => 'anime manga crunchyroll season premiere trailer',
            'language'  => 'en',
            'apiKeyEnv' => 'NEWSAPI_KEY',
        ],
    ]);
    echo "✓ NewsAPI — Animes atualizada e ativada.\n";
} else {
    Source::create([
        'name'          => 'NewsAPI — Animes',
        'base_url'      => 'https://newsapi.org/v2',
        'source_type'   => 'api',
        'category_id'   => 3,
        'language'      => 'en',
        'is_active'     => true,
        'trust_level'   => 8,
        'configuration' => [
            'query'     => 'anime manga crunchyroll season premiere trailer',
            'language'  => 'en',
            'apiKeyEnv' => 'NEWSAPI_KEY',
        ],
    ]);
    echo "✓ NewsAPI — Animes criada e ativada.\n";
}

echo "Fontes ativas:\n";
Source::where('is_active', true)->each(fn($s) => print("  - {$s->name} (cat. {$s->category_id})\n"));
