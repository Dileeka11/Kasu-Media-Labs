<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            // Video played by the "Watch Showreel" hero button — a YouTube/Vimeo
            // link or a direct video URL. Falls back to the featured project.
            $table->string('showreel_url', 500)->nullable()->after('hero_video');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn('showreel_url');
        });
    }
};
