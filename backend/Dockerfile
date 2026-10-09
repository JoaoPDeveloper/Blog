FROM php:8.3-cli-alpine

RUN apk add --no-cache git curl bash libpq-dev zip unzip \
    && docker-php-ext-install pdo pdo_pgsql opcache pcntl

COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock* ./
RUN composer install --no-scripts --no-autoloader --prefer-dist

COPY . .

RUN composer dump-autoload --optimize

EXPOSE 8000

CMD php artisan serve --host=0.0.0.0 --port=8000
