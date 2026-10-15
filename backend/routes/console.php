<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Coleta de notícias e geração de artigos via IA
// Roda 2x por dia: 8h e 18h (horário de Brasília, UTC-3 = 11h e 21h UTC)
Schedule::command('news:fetch')->twiceDaily(8, 18);
