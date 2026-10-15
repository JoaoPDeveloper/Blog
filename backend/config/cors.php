<?php

return [
    'paths'           => ['api/*'],
    'allowed_methods' => ['*'],

    // Aceita múltiplas origens separadas por vírgula no env
    // Ex: FRONTEND_URL=https://meusite.vercel.app,http://localhost:3000
    'allowed_origins' => array_filter(
        array_map(
            'trim',
            explode(',', env('FRONTEND_URL', 'http://localhost:3000'))
        )
    ),

    // Padrões para aceitar qualquer subdomínio do Vercel automaticamente
    'allowed_origins_patterns' => [
        '#^https://.*\.vercel\.app$#',
    ],

    'allowed_headers'    => ['*'],
    'exposed_headers'    => [],
    'max_age'            => 86400,
    'supports_credentials' => false,
];
