FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git curl bash \
    libpq-dev zip unzip \
    ca-certificates \
    && update-ca-certificates \
    && docker-php-ext-install pdo pdo_pgsql opcache pcntl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /var/www/html

COPY composer.json composer.lock* ./
RUN composer install --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY . .

RUN composer dump-autoload --optimize --no-scripts

# Script wrapper: garante permissão de execução e delega ao entrypoint no volume
RUN echo '#!/bin/bash\nchmod +x /var/www/html/docker-entrypoint.sh\nexec /var/www/html/docker-entrypoint.sh "$@"' \
    > /usr/local/bin/entrypoint-wrapper.sh \
    && chmod +x /usr/local/bin/entrypoint-wrapper.sh

EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/entrypoint-wrapper.sh"]
