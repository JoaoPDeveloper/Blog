<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Coleta de notícias e geração de artigos via IA
// Roda 3x por dia: 8h, 12h e 18h (horário de Brasília), independente do timezone do servidor.
// Sem withoutOverlapping(): ele exige lock em cache/Redis.
Schedule::command('news:fetch')->cron('0 8,12,18 * * *')->timezone('America/Sao_Paulo');
