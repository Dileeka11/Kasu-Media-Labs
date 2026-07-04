<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Lead;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $monthly = collect(range(5, 0))->map(function (int $back) {
            $month = now()->subMonths($back);

            return [
                'month' => $month->format('M'),
                'revenue' => (float) Invoice::where('status', 'paid')
                    ->whereYear('issue_date', $month->year)
                    ->whereMonth('issue_date', $month->month)
                    ->sum('total'),
            ];
        });

        return response()->json([
            'revenue' => (float) Invoice::where('status', 'paid')->sum('total'),
            'outstanding' => (float) Invoice::whereIn('status', ['sent', 'overdue'])->sum('total'),
            'active_projects' => Project::whereIn('status', ['in_progress', 'review'])->count(),
            'total_clients' => Client::count(),
            'new_leads' => Lead::where('status', 'new')->count(),
            'monthly_revenue' => $monthly,
            'recent_projects' => Project::with('client')->latest()->take(5)->get(),
            'recent_leads' => Lead::latest()->take(5)->get(),
        ]);
    }
}
