<?php

/**
 * Router para o servidor built-in do PHP.
 * Emula o mod_rewrite do Apache para o Laravel.
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Health check ultra-rápido — responde ANTES de bootar o Laravel
// Usado pelo Railway para verificar se o container está vivo
if ($uri === '/health' || $uri === '/ping') {
    header('Content-Type: application/json');
    header('Cache-Control: no-cache');
    echo '{"status":"ok","service":"NovaTech API"}';
    return true;
}

// Serve arquivos estáticos diretamente (css, js, imagens, etc.)
if ($uri !== '/' && file_exists(__DIR__ . '/public' . $uri)) {
    return false;
}

require_once __DIR__ . '/public/index.php';
