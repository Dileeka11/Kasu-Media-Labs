<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Category;
use App\Models\Inquiry;
use App\Models\Project;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function site(): JsonResponse
    {
        $settings = Setting::instance();

        $statuses = $settings->show_drafts ? ['published', 'draft', 'review'] : ['published'];

        return response()->json([
            'studio_name' => $settings->studio_name,
            'contact_email' => $settings->contact_email,
            'font' => $settings->font,
            'logo_url' => $settings->logo_url,
            'hero_video_url' => $settings->hero_video_url,
            'showreel_url' => $settings->showreel_url,
            'hero_kicker' => $settings->hero_kicker,
            'hero_headline' => $settings->hero_headline,
            'hero_subheadline' => $settings->hero_subheadline,
            'phone' => $settings->phone,
            'address' => $settings->address,
            'socials' => $settings->socials,
            'stats' => $settings->stats,
            'clients' => $settings->clients,
            'testimonials' => $settings->testimonials,
            'ticker_items' => $settings->ticker_items,
            'projects' => Project::with('category')
                ->whereIn('status', $statuses)
                ->orderByDesc('published_at')
                ->orderByDesc('id')
                ->get(),
            'categories' => Category::withCount('projects')->orderBy('name')->get(),
        ]);
    }

    public function inquire(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:100'],
            'budget' => ['nullable', 'string', 'max:50'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $inquiry = Inquiry::create($data + ['unread' => true]);
        Activity::log('New inquiry from '.($inquiry->company ?: $inquiry->name));

        return response()->json(['message' => 'Thanks — we will get back to you shortly.'], 201);
    }
}
