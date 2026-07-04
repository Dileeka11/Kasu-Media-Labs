<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\DailyView;
use App\Models\Inquiry;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $last30 = DailyView::where('date', '>=', now()->subDays(30)->toDateString())
            ->orderBy('date')
            ->get();
        $prev30 = (float) DailyView::whereBetween('date', [
            now()->subDays(60)->toDateString(),
            now()->subDays(31)->toDateString(),
        ])->sum('views');

        $cur30 = (float) $last30->sum('views');
        $delta = $prev30 > 0 ? round((($cur30 - $prev30) / $prev30) * 100, 1) : 0.0;

        return response()->json([
            'total_projects' => Project::count(),
            'projects_this_month' => Project::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)->count(),
            'total_views' => (int) Project::sum('views'),
            'views_delta' => $delta,
            'new_inquiries' => Inquiry::whereDate('created_at', '>=', now()->subDays(30))->count(),
            'unread_inquiries' => Inquiry::where('unread', true)->count(),
            'published' => Project::where('status', 'published')->count(),
            'drafts' => Project::where('status', 'draft')->count(),
            'chart_bars' => $last30->take(-14)->pluck('views')->values(),
            'activity' => Activity::latest()->take(4)->get(),
        ]);
    }
}
