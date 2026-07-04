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
            // Uploaded media (stored paths on the public disk)
            $table->string('logo')->nullable()->after('contact_email');
            $table->string('hero_video')->nullable()->after('logo');

            // Hero copy
            $table->string('hero_kicker')->default('Full-Service Video Production House')->after('hero_video');
            $table->string('hero_headline')->default('We Create Videos That Move People')->after('hero_kicker');
            $table->string('hero_subheadline', 500)->default('From concept to final delivery — cinematic stories for brands, businesses, and creators.')->after('hero_headline');

            // Contact block
            $table->string('phone')->nullable()->after('hero_subheadline');
            $table->string('address')->nullable()->after('phone');

            // Repeatable / structured content
            $table->json('socials')->nullable()->after('address');      // { instagram, youtube, vimeo, linkedin }
            $table->json('stats')->nullable()->after('socials');        // [ { value, label } ]
            $table->json('clients')->nullable()->after('stats');        // [ { name } ]
            $table->json('testimonials')->nullable()->after('clients'); // [ { quote, author, role } ]
        });

        // Seed the singleton settings row with the content that used to be
        // hardcoded on the public site, so the admin editors start pre-filled.
        DB::table('settings')->updateOrInsert(
            ['id' => 1],
            [
                'phone' => '+1 (555) 019-2847',
                'address' => 'Bay 12, Riverside Media Park',
                'socials' => json_encode([
                    'instagram' => '', 'youtube' => '', 'vimeo' => '', 'linkedin' => '',
                ]),
                'stats' => json_encode([
                    ['value' => '250+', 'label' => 'Projects delivered'],
                    ['value' => '7 yrs', 'label' => 'In production'],
                    ['value' => '40+', 'label' => 'Brands served'],
                ]),
                'clients' => json_encode(array_map(
                    fn ($n) => ['name' => $n],
                    ['NOVA', 'Atlas Group', 'Vertex', 'LUMEN', 'Skyline', 'Orbit Media', 'Frameworks', 'Meridian']
                )),
                'testimonials' => json_encode([
                    ['quote' => 'The team transformed our idea into an incredible commercial. The production quality was outstanding.', 'author' => 'Sarah Lin', 'role' => 'Brand Manager, Aether'],
                    ['quote' => 'Their storytelling and cinematic quality elevated our brand far beyond what we imagined.', 'author' => 'Marcus Reed', 'role' => 'CMO, Vertex'],
                    ['quote' => 'From concept to delivery, flawless execution. We book them for every campaign now.', 'author' => 'Dana Okoye', 'role' => 'Head of Marketing, Lumen'],
                ]),
                'updated_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn([
                'logo', 'hero_video', 'hero_kicker', 'hero_headline', 'hero_subheadline',
                'phone', 'address', 'socials', 'stats', 'clients', 'testimonials',
            ]);
        });
    }
};
