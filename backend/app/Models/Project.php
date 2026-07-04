<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Project extends Model
{
    protected $fillable = ['client_id', 'name', 'type', 'status', 'budget', 'deadline', 'description'];

    protected function casts(): array
    {
        return [
            'budget' => 'float',
            'deadline' => 'date:Y-m-d',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
