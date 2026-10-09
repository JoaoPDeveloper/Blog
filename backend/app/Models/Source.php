<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Source extends Model
{
    protected $fillable = [
        'name',
        'base_url',
        'source_type',
        'category_id',
        'language',
        'is_active',
        'trust_level',
        'last_fetched_at',
        'configuration',
    ];

    protected $casts = [
        'is_active'       => 'boolean',
        'last_fetched_at' => 'datetime',
        'configuration'   => 'array',
    ];
}
