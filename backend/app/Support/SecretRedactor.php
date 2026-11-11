<?php

namespace App\Support;

class SecretRedactor
{
    /**
     * Esconde o valor de apiKey=, api_key=, key= e token= (query string) em mensagens
     * de exceção. O Http client/Guzzle inclui a URL completa, com a chave, na mensagem.
     */
    public static function redact(string $text): string
    {
        return preg_replace(
            '/(?<![A-Za-z0-9])(apiKey|api_key|key|token)=([^&\s"\'`<>)]*)/i',
            '$1=[REDACTED]',
            $text
        ) ?? $text;
    }
}
