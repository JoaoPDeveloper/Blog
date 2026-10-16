#!/bin/bash
set -e

echo "==> Iniciando NovaTech Backend..."
<<<<<<< Updated upstream
echo "==> PORT=$PORT"
=======
<<<<<<< Updated upstream
=======
echo "==> PORT=${PORT:-8080}"
>>>>>>> Stashed changes
>>>>>>> Stashed changes

# Em produção, variáveis são injetadas como env vars
if [ ! -f .env ]; then
    if [ -n "$APP_KEY" ]; then
        echo "==> Gerando .env..."
        printenv | grep -E "^(APP_|DB_|REDIS_|CACHE_|QUEUE_|SESSION_|LOG_|GEMINI_|OPENAI_|NEWSAPI_|AI_|ELASTICSEARCH_|FRONTEND_|MAIL_|ADMIN_)" | sort > .env
        echo "==> .env: $(wc -l < .env) variáveis."
    else
        echo "ERRO: APP_KEY não definido."
        exit 1
    fi
fi

# Vendor
if [ ! -f vendor/autoload.php ]; then
    echo "==> composer install..."
    composer install --no-scripts --no-autoloader --prefer-dist --no-interaction --quiet
    composer dump-autoload --optimize --no-scripts --quiet
else
    echo "==> Vendor OK."
fi

# Storage
mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

<<<<<<< Updated upstream
# Cache do Laravel
=======
<<<<<<< Updated upstream
# Limpar e recriar config cache
>>>>>>> Stashed changes
rm -f bootstrap/cache/services.php bootstrap/cache/packages.php bootstrap/cache/config.php
php artisan config:cache --quiet 2>/dev/null || echo "AVISO: config:cache falhou (continuando)"
php artisan route:cache  --quiet 2>/dev/null || echo "AVISO: route:cache falhou (continuando)"

# Migrations e seed
echo "==> Rodando migrations..."
php artisan migrate --force --quiet 2>/dev/null || echo "AVISO: migrate falhou (continuando)"
echo "==> Rodando seed..."
php artisan db:seed --force --quiet 2>/dev/null || echo "AVISO: seed falhou (continuando)"

# Scheduler em background
<<<<<<< Updated upstream
=======
echo "==> Iniciando scheduler..."
=======
# Laravel cache
rm -f bootstrap/cache/services.php bootstrap/cache/packages.php bootstrap/cache/config.php
php artisan config:cache --quiet 2>/dev/null || echo "AVISO: config:cache falhou"
php artisan route:cache  --quiet 2>/dev/null || echo "AVISO: route:cache falhou"

# Migrations
echo "==> Migrations..."
php artisan migrate --force --quiet 2>/dev/null || echo "AVISO: migrate falhou"
echo "==> Seed..."
php artisan db:seed --force --quiet 2>/dev/null || echo "AVISO: seed falhou"

# Scheduler
>>>>>>> Stashed changes
>>>>>>> Stashed changes
while true; do
    php artisan schedule:run --no-interaction >> storage/logs/scheduler.log 2>&1
    sleep 60
done &
echo "==> Scheduler PID: $!"

<<<<<<< Updated upstream
# Gerar nginx.conf substituindo PORT
NGINX_PORT=${PORT:-8080}
echo "==> Configurando nginx na porta $NGINX_PORT..."
envsubst '${PORT}' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Testar configuração do nginx
nginx -t

=======
<<<<<<< Updated upstream
>>>>>>> Stashed changes
# Iniciar PHP-FPM em background
echo "==> Iniciando PHP-FPM..."
php-fpm -D
echo "==> PHP-FPM iniciado."

# Iniciar nginx em foreground (processo principal)
echo "==> Iniciando nginx na porta $NGINX_PORT..."
exec nginx -g 'daemon off;'
=======
# Nginx config com PORT dinâmico
NGINX_PORT=${PORT:-8080}
echo "==> Configurando nginx na porta $NGINX_PORT..."
envsubst '${PORT}' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Teste de config
nginx -t 2>&1

# PHP-FPM
echo "==> PHP-FPM..."
php-fpm -D
sleep 2
echo "==> PHP-FPM iniciado."

# Nginx em background para teste
echo "==> nginx iniciando..."
nginx -g 'daemon off;' &
NGINX_PID=$!
sleep 3

# Teste interno — confirma se nginx está respondendo
echo "==> Testando nginx internamente..."
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${NGINX_PORT}/health" 2>&1)
echo "==> /health interno retornou: $HEALTH_CODE"

if [ "$HEALTH_CODE" = "200" ]; then
    echo "==> nginx OK! Aguardando..."
    wait $NGINX_PID
else
    echo "ERRO: nginx não responde! Código: $HEALTH_CODE"
    echo "==> Logs do nginx:"
    cat /var/log/nginx/error.log 2>/dev/null || echo "(vazio)"
    echo "==> Verificando portas em uso:"
    ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null || echo "(ss/netstat indisponível)"
    exit 1
fi
>>>>>>> Stashed changes
