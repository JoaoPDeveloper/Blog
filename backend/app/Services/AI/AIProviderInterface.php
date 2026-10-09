<?php

namespace App\Services\AI;

interface AIProviderInterface
{
    public function generateArticle(array $sourceData): array;

    public function estimateCost(int $inputTokens, int $outputTokens): float;

    public function getProviderName(): string;
}
