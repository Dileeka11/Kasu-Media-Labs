<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyView extends Model
{
    protected $fillable = ['date', 'views'];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'views' => 'integer',
        ];
    }
}
