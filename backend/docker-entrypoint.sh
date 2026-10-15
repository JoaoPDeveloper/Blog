#!/bin/bash
set -e

echo "==> Iniciando NovaTech Backend..."

if [ ! -f .env ]; then
    echo "ERRO: backend/.env nao encontrado."
    exit 1
fi

# Instalar dependências apenas se vendor estiver ausente
if [ ! -f vendor/autoload.php ]; then
    echo "==> Instalando dependências (composer install)..."
    composer install --no-scripts --no-autoloader --prefer-dist --no-interaction --quiet
    echo "==> Gerando autoload..."
    composer dump-autoload --optimize --no-scripts --quiet
else
    echo "==> Vendor OK, pulando composer install."
fi

# Limpar cache para garantir leitura do .env atual
echo "==> Limpando cache..."
rm -f bootstrap/cache/services.php
rm -f bootstrap/cache/packages.php
rm -f bootstrap/cache/config.php

# Gerar APP_KEY se vazio
if grep -q "^APP_KEY=$" .env 2>/dev/null; then
    echo "==> Gerando APP_KEY..."
    php artisan key:generate --ansi
fi

# Cachear config e rotas para melhor performance
echo "==> Cacheando configurações..."
php artisan config:cache --quiet 2>/dev/null || true
php artisan route:cache --quiet 2>/dev/null || true

# Iniciar o scheduler do Laravel em background
# Executa 'php artisan schedule:run' a cada 60 segundos
echo "==> Iniciando scheduler de tarefas em background..."
while true; do
    php artisan schedule:run --verbose --no-interaction >> storage/logs/scheduler.log 2>&1
    sleep 60
done &
SCHEDULER_PID=$!
echo "==> Scheduler rodando (PID: $SCHEDULER_PID)"

echo "==> Pronto. Iniciando servidor em 0.0.0.0:8000..."
exec php -S 0.0.0.0:8000 server.php
