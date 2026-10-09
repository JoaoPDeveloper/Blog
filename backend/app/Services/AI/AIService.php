<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Log;

class AIService
{
    private AIProviderInterface $provider;

    public function __construct()
    {
        $this->provider = match (config('services.ai.provider', 'gemini')) {
            'openai' => new OpenAIProvider(),
            default  => new GeminiProvider(),
        };
    }

    public function generateArticle(array $sourceData): array
    {
        Log::info('AIService: generating article', [
            'provider' => $this->provider->getProviderName(),
            'category' => $sourceData['category'] ?? null,
        ]);

        $result = $this->provider->generateArticle($sourceData);

        $result['ai_provider'] = $this->provider->getProviderName();
        $result['ai_model']    = config('services.' . $this->provider->getProviderName() . '.model');

        return $result;
    }

    public function getProvider(): AIProviderInterface
    {
        return $this->provider;
    }
}
