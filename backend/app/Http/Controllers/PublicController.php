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
