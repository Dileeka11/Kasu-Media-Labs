<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Category;
use App\Models\DailyView;
use App\Models\Inquiry;
use App\Models\Project;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Team from the design (login demo: admin@kml / kml — alias for Karim)
        $users = [
            ['name' => 'Karim Malik', 'email' => 'karim@kmlproduction.com', 'role' => 'owner', 'last_active_at' => now()],
            ['name' => 'Lena Ross', 'email' => 'lena@kmlproduction.com', 'role' => 'editor', 'last_active_at' => now()->subHours(2)],
            ['name' => 'Devon Pratt', 'email' => 'devon@kmlproduction.com', 'role' => 'producer', 'last_active_at' => now()->subDay()],
            ['name' => 'Maya Osei', 'email' => 'maya@kmlproduction.com', 'role' => 'viewer', 'last_active_at' => now()->subDays(4)],
        ];
        foreach ($users as $user) {
            User::create($user + ['password' => 'kml']);
        }

        $categories = ['Commercials', 'Corporate', 'Product Films', 'Social Media Ads', 'Documentaries'];
        $catIds = [];
        foreach ($categories as $name) {
            $catIds[$name] = Category::create(['name' => $name, 'slug' => str($name)->slug()])->id;
        }

        $projects = [
            ['title' => 'Aether — Brand Film', 'cat' => 'Commercials', 'status' => 'published', 'views' => 82100, 'days_ago' => 4, 'client' => 'Aether Studios', 'duration' => '2:14'],
            ['title' => 'Skyline Towers Reveal', 'cat' => 'Documentaries', 'status' => 'published', 'views' => 44700, 'days_ago' => 7, 'client' => 'Meridian Group', 'duration' => '3:40'],
            ['title' => 'Pulse Wireless Ad', 'cat' => 'Social Media Ads', 'status' => 'draft', 'views' => 0, 'days_ago' => 12, 'client' => 'Pulse', 'duration' => '0:30'],
            ['title' => 'Vertex Annual Film', 'cat' => 'Corporate', 'status' => 'published', 'views' => 19300, 'days_ago' => 17, 'client' => 'Vertex', 'duration' => '4:05'],
            ['title' => 'Lumen Watch Launch', 'cat' => 'Product Films', 'status' => 'review', 'views' => 6000, 'days_ago' => 24, 'client' => 'Lumen', 'duration' => '1:12'],
            ['title' => 'Orbit Founders Story', 'cat' => 'Corporate', 'status' => 'published', 'views' => 31800, 'days_ago' => 31, 'client' => 'Orbit Media', 'duration' => '5:22'],
        ];
        foreach ($projects as $p) {
            Project::create([
                'title' => $p['title'],
                'category_id' => $catIds[$p['cat']],
                'client' => $p['client'],
                'video_url' => 'https://vimeo.com/'.random_int(100000000, 999999999),
                'duration' => $p['duration'],
                'status' => $p['status'],
                'views' => $p['views'],
                'published_at' => $p['status'] === 'published' || $p['status'] === 'review'
                    ? now()->subDays($p['days_ago'])->toDateString()
                    : now()->subDays($p['days_ago'])->toDateString(),
                'created_at' => now()->subDays($p['days_ago']),
            ]);
        }

        $inquiries = [
            ['name' => 'Elena Vasquez', 'company' => 'Aether Studios', 'email' => 'elena@aetherstudios.com', 'type' => 'Commercial', 'budget' => '$25k–50k', 'unread' => true, 'hours_ago' => 2, 'message' => 'Looking for a 60s hero film for our spring launch…'],
            ['name' => 'Tom Bishop', 'company' => 'Meridian Group', 'email' => 'tom@meridiangroup.com', 'type' => 'Corporate', 'budget' => '$10k–25k', 'unread' => true, 'hours_ago' => 5, 'message' => 'Need an annual company film, ~4 minutes.'],
            ['name' => 'Priya Nair', 'company' => 'Lumen', 'email' => 'priya@lumen.co', 'type' => 'Product Film', 'budget' => '$5k–10k', 'unread' => true, 'hours_ago' => 24, 'message' => 'Product launch video for our new watch line.'],
            ['name' => 'Carlos Mendez', 'company' => 'Orbit Media', 'email' => 'carlos@orbitmedia.com', 'type' => 'Documentary', 'budget' => '$50k+', 'unread' => false, 'hours_ago' => 48, 'message' => 'Founder documentary, multi-day shoot.'],
            ['name' => 'Anna Kim', 'company' => 'Pulse', 'email' => 'anna@pulse.io', 'type' => 'Social Ads', 'budget' => '$5k–10k', 'unread' => false, 'hours_ago' => 72, 'message' => 'Batch of 6 vertical social ads.'],
        ];
        foreach ($inquiries as $q) {
            Inquiry::create([
                'name' => $q['name'],
                'company' => $q['company'],
                'email' => $q['email'],
                'type' => $q['type'],
                'budget' => $q['budget'],
                'message' => $q['message'],
                'unread' => $q['unread'],
                'created_at' => now()->subHours($q['hours_ago']),
                'updated_at' => now()->subHours($q['hours_ago']),
            ]);
        }

        $activities = [
            ['title' => '“Lumen Watch Launch” published', 'meta' => 'by Lena', 'hours_ago' => 2],
            ['title' => 'New inquiry from Aether Studios', 'meta' => null, 'hours_ago' => 2],
            ['title' => '“Pulse Wireless Ad” moved to Draft', 'meta' => 'by Devon', 'hours_ago' => 26],
            ['title' => 'Maya Osei invited as Viewer', 'meta' => null, 'hours_ago' => 50],
        ];
        foreach ($activities as $a) {
            Activity::create([
                'title' => $a['title'],
                'meta' => $a['meta'],
                'created_at' => now()->subHours($a['hours_ago']),
                'updated_at' => now()->subHours($a['hours_ago']),
            ]);
        }

        // Rising daily views for the dashboard chart (last 60 days)
        foreach (range(60, 0) as $back) {
            $trend = (60 - $back) * 220;
            DailyView::create([
                'date' => now()->subDays($back)->toDateString(),
                'views' => 5200 + $trend + random_int(-900, 1400),
            ]);
        }

        Setting::create([
            'studio_name' => 'KML Production',
            'contact_email' => 'hello@kmlproduction.com',
            'email_on_inquiries' => true,
            'auto_publish' => true,
            'show_drafts' => false,
        ]);
    }
}
