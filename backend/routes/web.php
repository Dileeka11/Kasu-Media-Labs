<?php

use Illuminate\Support\Facades\Route;

// Serve the built React SPA (frontend/dist/index.html, uploaded as public/spa.html).
// Real files (assets, images, /storage) are served by Apache directly; every
// other GET falls through to the SPA so client-side routes like /admin work.
$spa = fn () => file_exists(public_path('spa.html'))
    ? response()->file(public_path('spa.html'))
    : view('welcome');

Route::get('/', $spa);
Route::fallback($spa);
