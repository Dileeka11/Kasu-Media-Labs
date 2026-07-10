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
            // "The gear" section — image (stored path on the public disk), copy,
            // and the equipment pills shown beside it.
            $table->string('gear_image')->nullable()->after('about_features');
            $table->string('gear_kicker')->default('The gear')->after('gear_image');
            $table->string('gear_heading')->default('Professional gear. Professional results.')->after('gear_kicker');
            $table->text('gear_body')->nullable()->after('gear_heading');
            $table->json('gear_items')->nullable()->after('gear_body'); // [ "Cinema Cameras", … ]
        });

        // Seed the singleton row with the copy that used to be hardcoded on the
        // public site, so the admin editor starts pre-filled.
        DB::table('settings')->where('id', 1)->update([
            'gear_body' => 'We shoot on cinema-grade equipment and light every frame with intent — so your story looks as premium as your brand.',
            'gear_items' => json_encode(['Cinema Cameras', 'Professional Lighting', 'Aerial Drones', 'Gimbal Stabilizers', 'Sound Equipment', 'Full Studio Setup']),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['gear_image', 'gear_kicker', 'gear_heading', 'gear_body', 'gear_items']);
        });
    }
};
