#!/bin/bash
set -e

echo "==> Iniciando NovaTech Backend..."

# Em produção (Railway/cloud), as variáveis são injetadas como env vars, sem arquivo .env
# Em desenvolvimento (Docker local), o .env existe como arquivo
if [ ! -f .env ]; then
    if [ -n "$APP_KEY" ]; then
        echo "==> Gerando .env a partir das variáveis de ambiente (modo produção)..."
        # Exporta todas as variáveis relevantes para o arquivo .env que o Laravel usa
        printenv | grep -E "^(APP_|DB_|REDIS_|CACHE_|QUEUE_|SESSION_|LOG_|GEMINI_|OPENAI_|NEWSAPI_|AI_|ELASTICSEARCH_|FRONTEND_|MAIL_)" | sort > .env
        echo "==> .env criado com $(wc -l < .env) variáveis."
    else
        echo "ERRO: .env nao encontrado e APP_KEY nao definido."
        echo "Em desenvolvimento: crie backend/.env"
        echo "Em producao: configure as variaveis no Railway."
        exit 1
    fi
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

# Limpar cache
echo "==> Limpando cache..."
rm -f bootstrap/cache/services.php
rm -f bootstrap/cache/packages.php
rm -f bootstrap/cache/config.php

# Gerar APP_KEY se vazio
if grep -q "^APP_KEY=$" .env 2>/dev/null; then
    echo "==> Gerando APP_KEY..."
    php artisan key:generate --ansi
fi

# Cachear config e rotas
echo "==> Cacheando configurações..."
php artisan config:cache --quiet 2>/dev/null || true
php artisan route:cache --quiet 2>/dev/null || true

# Rodar migrations automaticamente no deploy
echo "==> Rodando migrations..."
php artisan migrate --force --quiet 2>/dev/null || true

# Seed inicial: só roda se não houver categorias cadastradas
CATEGORY_COUNT=$(php artisan tinker --execute="echo App\Models\Category::count();" 2>/dev/null | tail -1)
if [ "$CATEGORY_COUNT" = "0" ] || [ -z "$CATEGORY_COUNT" ]; then
    echo "==> Rodando seed inicial..."
    php artisan db:seed --force --quiet 2>/dev/null || true
else
    echo "==> Seed já foi executado ($CATEGORY_COUNT categorias), pulando."
fi

# Scheduler em background
echo "==> Iniciando scheduler de tarefas em background..."
while true; do
    php artisan schedule:run --no-interaction >> storage/logs/scheduler.log 2>&1
    sleep 60
done &
echo "==> Scheduler rodando (PID: $!)"

echo "==> Pronto. Iniciando servidor em 0.0.0.0:8000..."
exec php -S 0.0.0.0:8000 server.php
