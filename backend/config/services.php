<?php

return [
    'admin_token' => env('ADMIN_TOKEN', ''),

    'ai' => [
        'provider'             => env('AI_PROVIDER', 'gemini'),
        'max_articles_per_day' => (int) env('AI_MAX_ARTICLES_PER_DAY', 3),
        'cost_limit_usd'       => (float) env('AI_ESTIMATED_COST_LIMIT_USD', 1.00),
    ],

    'gemini' => [
        'key'   => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-2.0-flash'),
    ],

    'openai' => [
        'key'   => env('OPENAI_API_KEY'),
        'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
    ],

    'newsapi' => [
        'key'      => env('NEWSAPI_KEY'),
        'language' => env('NEWSAPI_LANGUAGE', 'pt'),
    ],
];
