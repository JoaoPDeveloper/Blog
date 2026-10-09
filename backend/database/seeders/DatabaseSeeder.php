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

        // Categories
        $ia = Category::firstOrCreate(
            ['slug' => 'inteligencia-artificial'],
            [
                'name'        => 'Inteligência Artificial',
                'description' => 'Notícias sobre IA, modelos de linguagem, ferramentas e tendências do setor.',
                'is_active'   => true,
            ]
        );

        $jogos = Category::firstOrCreate(
            ['slug' => 'jogos'],
            [
                'name'        => 'Jogos',
                'description' => 'Lançamentos, atualizações, promoções e novidades do mundo dos games.',
                'is_active'   => true,
            ]
        );

        $animes = Category::firstOrCreate(
            ['slug' => 'animes-mangas'],
            [
                'name'        => 'Animes & Mangás',
                'description' => 'Anúncios de temporadas, estreias, trailers e notícias de estúdios e eventos.',
                'is_active'   => true,
            ]
        );

        // Sources
        Source::firstOrCreate(
            ['name' => 'NewsAPI — IA'],
            [
                'base_url'      => 'https://newsapi.org/v2/everything',
                'source_type'   => 'api',
                'category_id'   => $ia->id,
                'language'      => 'pt',
                'is_active'     => true,
                'trust_level'   => 7,
                'configuration' => [
                    'apiKeyEnv' => 'NEWSAPI_KEY',
                    'query'     => 'inteligência artificial OR machine learning OR LLM',
                    'language'  => 'pt',
                    'pageSize'  => 5,
                ],
            ]
        );

        Source::firstOrCreate(
            ['name' => 'NewsAPI — Jogos'],
            [
                'base_url'      => 'https://newsapi.org/v2/everything',
                'source_type'   => 'api',
                'category_id'   => $jogos->id,
                'language'      => 'pt',
                'is_active'     => true,
                'trust_level'   => 7,
                'configuration' => [
                    'apiKeyEnv' => 'NEWSAPI_KEY',
                    'query'     => 'games jogos videogame lançamento',
                    'language'  => 'pt',
                    'pageSize'  => 5,
                ],
            ]
        );

        Source::firstOrCreate(
            ['name' => 'Jikan API — Animes'],
            [
                'base_url'      => 'https://api.jikan.moe/v4',
                'source_type'   => 'api',
                'category_id'   => $animes->id,
                'language'      => 'pt',
                'is_active'     => true,
                'trust_level'   => 8,
                'configuration' => [
                    'endpoint' => '/top/anime',
                    'params'   => [
                        'type'   => 'tv',
                        'filter' => 'airing',
                        'limit'  => 5,
                    ],
                ],
            ]
        );

        Source::firstOrCreate(
            ['name' => 'IGN Brasil RSS'],
            [
                'base_url'      => 'https://br.ign.com/feed.xml',
                'source_type'   => 'rss',
                'category_id'   => $jogos->id,
                'language'      => 'pt',
                'is_active'     => true,
                'trust_level'   => 8,
                'configuration' => [
                    'feedUrl' => 'https://br.ign.com/feed.xml',
                ],
            ]
        );

        Source::firstOrCreate(
            ['name' => 'GameVicio RSS'],
            [
                'base_url'      => 'https://www.gamevicio.com/rss/',
                'source_type'   => 'rss',
                'category_id'   => $jogos->id,
                'language'      => 'pt',
                'is_active'     => true,
                'trust_level'   => 7,
                'configuration' => [
                    'feedUrl' => 'https://www.gamevicio.com/rss/',
                ],
            ]
        );
    }
}
