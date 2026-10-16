#!/bin/bash
set -e

echo "==> Iniciando NovaTech Backend..."
echo "==> PORT=$PORT"

# Em produção, variáveis são injetadas como env vars
if [ ! -f .env ]; then
    if [ -n "$APP_KEY" ]; then
        echo "==> Gerando .env a partir das variáveis de ambiente..."
        printenv | grep -E "^(APP_|DB_|REDIS_|CACHE_|QUEUE_|SESSION_|LOG_|GEMINI_|OPENAI_|NEWSAPI_|AI_|ELASTICSEARCH_|FRONTEND_|MAIL_|ADMIN_)" | sort > .env
        echo "==> .env criado com $(wc -l < .env) variáveis."
    else
        echo "ERRO: .env nao encontrado e APP_KEY nao definido."
        exit 1
    fi
fi

# Instalar dependências se ausentes
if [ ! -f vendor/autoload.php ]; then
    echo "==> Instalando dependências..."
    composer install --no-scripts --no-autoloader --prefer-dist --no-interaction --quiet
    composer dump-autoload --optimize --no-scripts --quiet
else
    echo "==> Vendor OK."
fi

# Garantir diretórios de storage
mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# Cache do Laravel
rm -f bootstrap/cache/services.php bootstrap/cache/packages.php bootstrap/cache/config.php
php artisan config:cache --quiet 2>/dev/null || echo "AVISO: config:cache falhou (continuando)"
php artisan route:cache  --quiet 2>/dev/null || echo "AVISO: route:cache falhou (continuando)"

# Migrations e seed
echo "==> Rodando migrations..."
php artisan migrate --force --quiet 2>/dev/null || echo "AVISO: migrate falhou (continuando)"
echo "==> Rodando seed..."
php artisan db:seed --force --quiet 2>/dev/null || echo "AVISO: seed falhou (continuando)"

# Scheduler em background
while true; do
    php artisan schedule:run --no-interaction >> storage/logs/scheduler.log 2>&1
    sleep 60
done &
echo "==> Scheduler rodando (PID: $!)"

# Gerar nginx.conf substituindo PORT
NGINX_PORT=${PORT:-8080}
echo "==> Configurando nginx na porta $NGINX_PORT..."
envsubst '${PORT}' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Testar configuração do nginx
nginx -t

# Iniciar PHP-FPM em background
echo "==> Iniciando PHP-FPM..."
php-fpm -D
echo "==> PHP-FPM iniciado."

# Iniciar nginx em foreground (processo principal)
echo "==> Iniciando nginx na porta $NGINX_PORT..."
exec nginx -g 'daemon off;'
