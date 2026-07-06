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
            $table->json('ticker_items')->nullable()->after('testimonials'); // [ "Commercials", ... ]
        });

        // Seed with the services that used to be hardcoded on the public site.
        DB::table('settings')->where('id', 1)->update([
            'ticker_items' => json_encode([
                'Commercials', 'Corporate Films', 'Product Videos',
                'Drone Cinematography', 'Documentaries', 'Motion Graphics',
            ]),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn('ticker_items');
        });
    }
};
