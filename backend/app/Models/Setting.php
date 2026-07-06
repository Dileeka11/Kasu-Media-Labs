<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'studio_name', 'contact_email', 'font', 'email_on_inquiries', 'auto_publish', 'show_drafts',
        'logo', 'hero_video', 'showreel_url', 'hero_kicker', 'hero_headline', 'hero_subheadline',
        'phone', 'address', 'socials', 'stats', 'clients', 'testimonials', 'ticker_items',
    ];

    protected $appends = ['logo_url', 'hero_video_url'];

    protected function casts(): array
    {
        return [
            'email_on_inquiries' => 'boolean',
            'auto_publish' => 'boolean',
            'show_drafts' => 'boolean',
            'socials' => 'array',
            'stats' => 'array',
            'clients' => 'array',
            'testimonials' => 'array',
            'ticker_items' => 'array',
        ];
    }

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo ? asset('storage/'.$this->logo) : null;
    }

    public function getHeroVideoUrlAttribute(): ?string
    {
        return $this->hero_video ? asset('storage/'.$this->hero_video) : null;
    }

    public static function instance(): self
    {
        return static::firstOrCreate(['id' => 1]);
    }
}
