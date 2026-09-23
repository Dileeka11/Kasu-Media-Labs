<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // In production every asset()/url() must be https, otherwise storage
        // image URLs come back as http:// and trigger Chrome's mixed-content
        // "Not secure" warning on the (https) public site. Force it regardless
        // of APP_URL's scheme or the incoming request scheme.
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
