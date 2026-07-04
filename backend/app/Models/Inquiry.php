<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    protected $fillable = ['name', 'company', 'email', 'type', 'budget', 'message', 'unread'];

    protected function casts(): array
    {
        return [
            'unread' => 'boolean',
        ];
    }
}
