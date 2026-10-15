<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Source;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::firstOrCreate(
            ['email' => 'admin@novatech.local'],
            [
                'name'     => 'Admin',
                'password' => Hash::make('password'),
                'role'     => 'admin',
            ]
        );

        // Categorias
        $ia = Category::firstOrCreate(
            ['slug' => 'inteligencia-artificial'],
            ['name' => 'Inteligência Artificial', 'description' => 'Notícias sobre IA, modelos de linguagem, ferramentas e tendências.', 'is_active' => true]
        );

        $jogos = Category::firstOrCreate(
            ['slug' => 'jogos'],
            ['name' => 'Jogos', 'description' => 'Lançamentos, atualizações, promoções e novidades do mundo dos games.', 'is_active' => true]
        );

        $animes = Category::firstOrCreate(
            ['slug' => 'animes-mangas'],
            ['name' => 'Animes & Mangás', 'description' => 'Anúncios de temporadas, estreias, trailers e notícias de estúdios.', 'is_active' => true]
        );

        // Fontes ativas (queries em inglês — IA gera artigo em PT-BR)
        Source::firstOrCreate(
            ['name' => 'NewsAPI — IA'],
            [
                'base_url'      => 'https://newsapi.org/v2',
                'source_type'   => 'api',
                'category_id'   => $ia->id,
                'language'      => 'en',
                'is_active'     => true,
                'trust_level'   => 8,
                'configuration' => [
                    'query'     => 'artificial intelligence AI OpenAI Google Gemini LLM',
                    'language'  => 'en',
                    'apiKeyEnv' => 'NEWSAPI_KEY',
                ],
            ]
        );

        Source::firstOrCreate(
            ['name' => 'NewsAPI — Jogos'],
            [
                'base_url'      => 'https://newsapi.org/v2',
                'source_type'   => 'api',
                'category_id'   => $jogos->id,
                'language'      => 'en',
                'is_active'     => true,
                'trust_level'   => 8,
                'configuration' => [
                    'query'     => 'video games PlayStation Xbox Nintendo PC gaming release',
                    'language'  => 'en',
                    'apiKeyEnv' => 'NEWSAPI_KEY',
                ],
            ]
        );

        Source::firstOrCreate(
            ['name' => 'NewsAPI — Animes'],
            [
                'base_url'      => 'https://newsapi.org/v2',
                'source_type'   => 'api',
                'category_id'   => $animes->id,
                'language'      => 'en',
                'is_active'     => true,
                'trust_level'   => 8,
                'configuration' => [
                    'query'     => 'anime manga crunchyroll season premiere trailer',
                    'language'  => 'en',
                    'apiKeyEnv' => 'NEWSAPI_KEY',
                ],
            ]
        );

        // Fontes inativas (implementação futura)
        Source::firstOrCreate(
            ['name' => 'Jikan API — Animes'],
            [
                'base_url'      => 'https://api.jikan.moe/v4',
                'source_type'   => 'api',
                'category_id'   => $animes->id,
                'language'      => 'pt',
                'is_active'     => false,
                'trust_level'   => 8,
                'configuration' => ['type' => 'top_airing'],
            ]
        );

        Source::firstOrCreate(
            ['name' => 'IGN Brasil RSS'],
            [
                'base_url'      => 'https://br.ign.com/feed.xml',
                'source_type'   => 'rss',
                'category_id'   => $jogos->id,
                'language'      => 'pt',
                'is_active'     => false,
                'trust_level'   => 9,
                'configuration' => ['feedUrl' => 'https://br.ign.com/feed.xml'],
            ]
        );
    }
}
