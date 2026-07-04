<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Lead;
use App\Models\Project;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'KML Admin',
            'email' => 'admin@kasumedialabs.com',
            'password' => 'kml@admin123',
            'role' => 'admin',
        ]);

        $services = [
            ['name' => 'Promotional Video', 'category' => 'Video', 'price' => 75000, 'unit' => 'per project'],
            ['name' => 'Social Media Reel', 'category' => 'Video', 'price' => 15000, 'unit' => 'per item'],
            ['name' => 'Logo & Brand Identity', 'category' => 'Design', 'price' => 45000, 'unit' => 'per project'],
            ['name' => 'Social Media Post Design', 'category' => 'Design', 'price' => 3500, 'unit' => 'per item'],
            ['name' => 'Business Website', 'category' => 'Web', 'price' => 120000, 'unit' => 'per project'],
            ['name' => 'Social Media Management', 'category' => 'Marketing', 'price' => 35000, 'unit' => 'per month'],
            ['name' => 'Product Photography', 'category' => 'Photography', 'price' => 25000, 'unit' => 'per day'],
        ];
        foreach ($services as $service) {
            Service::create($service + ['active' => true]);
        }

        $clients = [
            ['name' => 'Nimal Perera', 'company' => 'Perera Motors', 'email' => 'nimal@pereramotors.lk', 'phone' => '077 123 4567', 'status' => 'active'],
            ['name' => 'Shanika Fernando', 'company' => 'Lanka Bites Restaurant', 'email' => 'shanika@lankabites.lk', 'phone' => '071 987 6543', 'status' => 'active'],
            ['name' => 'Ruwan Jayasuriya', 'company' => 'RJ Constructions', 'email' => 'ruwan@rjcon.lk', 'phone' => '076 555 2211', 'status' => 'active'],
            ['name' => 'Dilani Wickramasinghe', 'company' => 'Bloom Beauty Salon', 'email' => 'dilani@bloombeauty.lk', 'phone' => '070 444 8899', 'status' => 'inactive'],
        ];
        foreach ($clients as $client) {
            Client::create($client);
        }

        $projects = [
            ['client_id' => 1, 'name' => 'Showroom Launch Video', 'type' => 'video_production', 'status' => 'in_progress', 'budget' => 150000, 'deadline' => now()->addDays(20)->toDateString()],
            ['client_id' => 2, 'name' => 'Menu Redesign & Photos', 'type' => 'graphic_design', 'status' => 'review', 'budget' => 60000, 'deadline' => now()->addDays(7)->toDateString()],
            ['client_id' => 2, 'name' => 'Instagram Campaign — July', 'type' => 'social_media', 'status' => 'in_progress', 'budget' => 35000, 'deadline' => now()->addDays(27)->toDateString()],
            ['client_id' => 3, 'name' => 'Corporate Website', 'type' => 'web_development', 'status' => 'planning', 'budget' => 180000, 'deadline' => now()->addDays(45)->toDateString()],
            ['client_id' => 4, 'name' => 'Salon Rebranding', 'type' => 'branding', 'status' => 'completed', 'budget' => 55000, 'deadline' => now()->subDays(10)->toDateString()],
        ];
        foreach ($projects as $project) {
            Project::create($project);
        }

        $invoiceRows = [
            ['client_id' => 4, 'status' => 'paid', 'months_back' => 2, 'items' => [['description' => 'Salon Rebranding — logo & identity', 'quantity' => 1, 'unit_price' => 45000], ['description' => 'Signage design', 'quantity' => 1, 'unit_price' => 10000]]],
            ['client_id' => 2, 'status' => 'paid', 'months_back' => 1, 'items' => [['description' => 'Social media management — June', 'quantity' => 1, 'unit_price' => 35000]]],
            ['client_id' => 1, 'status' => 'sent', 'months_back' => 0, 'items' => [['description' => 'Showroom launch video — 50% advance', 'quantity' => 1, 'unit_price' => 75000]]],
            ['client_id' => 3, 'status' => 'overdue', 'months_back' => 1, 'items' => [['description' => 'Website wireframes & planning', 'quantity' => 1, 'unit_price' => 30000]]],
        ];
        foreach ($invoiceRows as $row) {
            $issue = now()->subMonths($row['months_back'])->subDays(5);
            $total = collect($row['items'])->sum(fn ($item) => $item['quantity'] * $item['unit_price']);
            $invoice = Invoice::create([
                'client_id' => $row['client_id'],
                'invoice_number' => Invoice::nextNumber(),
                'issue_date' => $issue->toDateString(),
                'due_date' => $issue->copy()->addDays(14)->toDateString(),
                'status' => $row['status'],
                'total' => $total,
            ]);
            $invoice->items()->createMany($row['items']);
        }

        $leads = [
            ['name' => 'Kasun Silva', 'email' => 'kasun.silva@gmail.com', 'phone' => '075 111 2233', 'source' => 'website', 'service_interest' => 'Business Website', 'status' => 'new', 'message' => 'Need a website for my export business.'],
            ['name' => 'Amaya Rathnayake', 'email' => 'amaya.r@yahoo.com', 'phone' => '072 333 4455', 'source' => 'social_media', 'service_interest' => 'Promotional Video', 'status' => 'contacted'],
            ['name' => 'Tharindu Bandara', 'email' => 'tharindu@apexgym.lk', 'phone' => '078 666 7788', 'source' => 'referral', 'service_interest' => 'Social Media Management', 'status' => 'qualified', 'message' => 'Gym opening next month, needs full package.'],
        ];
        foreach ($leads as $lead) {
            Lead::create($lead);
        }
    }
}
