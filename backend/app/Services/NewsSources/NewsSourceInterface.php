<?php

namespace App\Services\NewsSources;

interface NewsSourceInterface
{
    public function fetch(array $config): array;

    public function normalize(array $raw): array;

    public function getSourceType(): string;
}
