<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleSource extends Model
{
    protected $fillable = [
        'article_id',
        'source_id',
        'source_url',
        'source_title',
        'source_published_at',
        'retrieved_at',
    ];

    protected $casts = [
        'source_published_at' => 'datetime',
        'retrieved_at'        => 'datetime',
    ];

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(Source::class);
    }
}
