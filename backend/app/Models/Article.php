<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Article extends Model
{
    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'summary',
        'content',
        'status',
        'language',
        'original_published_at',
        'published_at',
        'ai_provider',
        'ai_model',
        'content_hash',
        'review_status',
    ];

    protected $casts = [
        'original_published_at' => 'datetime',
        'published_at'          => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'article_tags');
    }

    public function sources(): HasMany
    {
        return $this->hasMany(ArticleSource::class);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
