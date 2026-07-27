<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminRequestLog extends Model
{
    protected $fillable = [
        'user_id',
        'user_name',
        'method',
        'path',
        'route',
        'status',
        'ip',
        'user_agent',
        'payload',
        'duration_ms',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
