<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AutomationRun extends Model
{
    protected $fillable = [
        'source_id',
        'job_type',
        'status',
        'started_at',
        'finished_at',
        'items_processed',
        'items_succeeded',
        'items_failed',
        'estimated_cost',
        'error_summary',
        'metadata',
    ];

    protected $casts = [
        'started_at'     => 'datetime',
        'finished_at'    => 'datetime',
        'estimated_cost' => 'decimal:6',
        'metadata'       => 'array',
    ];
}
