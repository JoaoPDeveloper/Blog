#!/bin/bash
set -e

echo "==> Iniciando NovaTech Backend..."
echo "==> PORT=${PORT:-8080}"

if [ ! -f .env ]; then
    if [ -n "$APP_KEY" ]; then
        echo "==> Gerando .env..."
        printenv | grep -E "^(APP_|DB_|REDIS_|CACHE_|QUEUE_|SESSION_|LOG_|GEMINI_|OPENAI_|NEWSAPI_|AI_|ELASTICSEARCH_|FRONTEND_|MAIL_|ADMIN_)" | sort > .env
        echo "==> .env: $(wc -l < .env) variaveis."
    else
        echo "ERRO: APP_KEY nao definido."
        exit 1
    fi
fi

if [ ! -f vendor/autoload.php ]; then
    echo "==> composer install..."
    composer install --no-scripts --no-autoloader --prefer-dist --no-interaction --quiet
    composer dump-autoload --optimize --no-scripts --quiet
else
    echo "==> Vendor OK."
fi

mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

rm -f bootstrap/cache/services.php bootstrap/cache/packages.php bootstrap/cache/config.php
php artisan config:cache --quiet 2>/dev/null || echo "AVISO: config:cache falhou"
php artisan route:cache --quiet 2>/dev/null || echo "AVISO: route:cache falhou"

echo "==> Migrations..."
php artisan migrate --force --quiet 2>/dev/null || echo "AVISO: migrate falhou"
echo "==> Seed..."
php artisan db:seed --force --quiet 2>/dev/null || echo "AVISO: seed falhou"

while true; do
    php artisan schedule:run --no-interaction >> storage/logs/scheduler.log 2>&1
    sleep 60
done &
echo "==> Scheduler PID: $!"

NGINX_PORT=${PORT:-8080}
echo "==> Configurando nginx na porta $NGINX_PORT..."
envsubst '${PORT}' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf

nginx -t 2>&1

echo "==> PHP-FPM..."
php-fpm -D
sleep 2
echo "==> PHP-FPM iniciado."

nginx -g 'daemon off;' &
NGINX_PID=$!
sleep 3

echo "==> Testando nginx internamente..."
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${NGINX_PORT}/health" 2>&1)
echo "==> /health interno: $HEALTH_CODE"

if [ "$HEALTH_CODE" = "200" ]; then
    echo "==> nginx OK!"
    wait $NGINX_PID
else
    echo "ERRO: nginx nao responde ($HEALTH_CODE)"
    cat /var/log/nginx/error.log 2>/dev/null || echo "(sem log)"
    ss -tlnp 2>/dev/null || echo "(ss indisponivel)"
    exit 1
fi