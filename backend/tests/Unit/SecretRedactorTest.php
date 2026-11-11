<?php

namespace Tests\Unit;

use App\Support\SecretRedactor;
use PHPUnit\Framework\TestCase;

class SecretRedactorTest extends TestCase
{
    public function test_redacts_api_key_in_query(): void
    {
        $this->assertSame(
            'https://x/y?apiKey=[REDACTED]&q=1',
            SecretRedactor::redact('https://x/y?apiKey=abc123&q=1')
        );
    }

    public function test_redacts_key_at_end_of_url(): void
    {
        $this->assertSame(
            'https://x/y?key=[REDACTED]',
            SecretRedactor::redact('https://x/y?key=AIzaXYZ')
        );
    }

    public function test_redacts_api_key_and_token_in_guzzle_style_message(): void
    {
        $message = 'cURL error 28 for `POST https://g/v1?api_key=sec_1&token=tok2` (see https://curl.haxx.se/libcurl/c/libcurl-errors.html)';
        $redacted = SecretRedactor::redact($message);

        $this->assertStringNotContainsString('sec_1', $redacted);
        $this->assertStringNotContainsString('tok2', $redacted);
        $this->assertStringContainsString('api_key=[REDACTED]', $redacted);
        $this->assertStringContainsString('token=[REDACTED]', $redacted);
    }

    public function test_keeps_other_parameters_and_names_that_only_end_in_key(): void
    {
        $this->assertSame('monkey=banana&q=1', SecretRedactor::redact('monkey=banana&q=1'));
    }
}
