<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = ['title', 'meta'];

    public static function log(string $title, ?string $meta = null): void
    {
        static::create(['title' => $title, 'meta' => $meta]);
    }
}
