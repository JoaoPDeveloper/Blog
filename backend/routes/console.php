<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Agendamento via Schedule será configurado quando a Queue estiver ativa (Fase 3)
// Schedule::command('news:fetch')->dailyAt('08:00');
