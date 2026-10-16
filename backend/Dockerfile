FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    nginx libpq-dev zip unzip curl gettext-base \
    && docker-php-ext-install pdo pdo_pgsql opcache pcntl \
    && rm -rf /var/lib/apt/lists/*

# OPcache para produção
RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.max_accelerated_files=10000'; \
    echo 'opcache.validate_timestamps=1'; \
    echo 'opcache.revalidate_freq=60'; \
} > /usr/local/etc/php/conf.d/opcache.ini

COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /var/www/html

COPY composer.json composer.lock* ./
RUN composer install --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY . .
RUN composer dump-autoload --optimize --no-scripts

# Template do nginx — PORT será substituído pelo envsubst no entrypoint
COPY nginx.conf /etc/nginx/conf.d/nginx.conf.template
RUN rm -f /etc/nginx/sites-enabled/default

# Redirecionar logs do nginx para stdout/stderr do Docker
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Wrapper que delega ao entrypoint no volume bind
RUN printf '#!/bin/bash\nchmod +x /var/www/html/docker-entrypoint.sh\nexec /var/www/html/docker-entrypoint.sh "$@"\n' \
    > /usr/local/bin/entrypoint-wrapper.sh \
    && chmod +x /usr/local/bin/entrypoint-wrapper.sh

EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/entrypoint-wrapper.sh"]
