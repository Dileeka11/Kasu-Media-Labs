<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['studio_name', 'contact_email', 'email_on_inquiries', 'auto_publish', 'show_drafts'];

    protected function casts(): array
    {
        return [
            'email_on_inquiries' => 'boolean',
            'auto_publish' => 'boolean',
            'show_drafts' => 'boolean',
        ];
    }

    public static function instance(): self
    {
        return static::firstOrCreate(['id' => 1]);
    }
}
