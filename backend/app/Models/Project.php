<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Project extends Model
{
    protected $fillable = ['category_id', 'title', 'client', 'video_url', 'duration', 'thumbnail', 'status', 'views', 'published_at'];

    protected $appends = ['thumbnail_url'];

    protected function casts(): array
    {
        return [
            'views' => 'integer',
            'published_at' => 'date:Y-m-d',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail ? asset('storage/'.$this->thumbnail) : null;
    }
}
