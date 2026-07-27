<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            // Percentage scale for the hero headline (100 = default size).
            $table->unsignedSmallInteger('hero_headline_size')->default(100)->after('hero_headline');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn('hero_headline_size');
        });
    }
};
