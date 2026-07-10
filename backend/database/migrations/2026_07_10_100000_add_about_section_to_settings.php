<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            // "About the studio" section — image (stored path on the public disk),
            // copy, and the four feature pills shown beside it.
            $table->string('about_image')->nullable()->after('testimonials');
            $table->string('about_kicker')->default('About the studio')->after('about_image');
            $table->string('about_heading')->default('Storytelling meets cinematic craft')->after('about_kicker');
            $table->text('about_body1')->nullable()->after('about_heading');
            $table->text('about_body2')->nullable()->after('about_body1');
            $table->json('about_features')->nullable()->after('about_body2'); // [ "Creative Strategy", … ]
        });

        // Seed the singleton row with the copy that used to be hardcoded on the
        // public site, so the admin editor starts pre-filled.
        DB::table('settings')->where('id', 1)->update([
            'about_body1' => 'We are a full-service video production company dedicated to creating powerful visual stories. From concept development to post-production, our team combines creativity, strategy, and cutting-edge technology to produce high-quality content for brands, businesses, and creators.',
            'about_body2' => "Whether it's a commercial, corporate film, social content, or documentary — we bring your story to life with cinematic precision.",
            'about_features' => json_encode(['Creative Strategy', 'Professional Film Crew', 'High-End Equipment', 'End-to-End Production']),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['about_image', 'about_kicker', 'about_heading', 'about_body1', 'about_body2', 'about_features']);
        });
    }
};
