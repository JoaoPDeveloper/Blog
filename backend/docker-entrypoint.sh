#!/bin/bash
set -e

echo "==> Iniciando NovaTech Backend..."

if [ ! -f .env ]; then
    echo "ERRO: backend/.env nao encontrado."
    exit 1
fi

# Instalar dependências sempre do composer.json atual
# Garante que vendor nunca fique desatualizado com volumes antigos
echo "==> Instalando dependências (composer install)..."
composer install --no-scripts --no-autoloader --prefer-dist --no-interaction --quiet

echo "==> Gerando autoload..."
composer dump-autoload --optimize --no-scripts --quiet

# Limpar cache de providers
echo "==> Limpando cache..."
rm -f bootstrap/cache/services.php
rm -f bootstrap/cache/packages.php
rm -f bootstrap/cache/config.php

# Gerar APP_KEY se vazio
if grep -q "^APP_KEY=$" .env 2>/dev/null; then
    echo "==> Gerando APP_KEY..."
    php artisan key:generate --ansi
fi

echo "==> Pronto. Iniciando servidor em 0.0.0.0:8000..."
exec php -S 0.0.0.0:8000 server.php
