<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Project::with('client')->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $project = Project::create($this->validated($request));

        return response()->json($project->load('client'), 201);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $project->update($this->validated($request));

        return response()->json($project->load('client'));
    }

    public function destroy(Project $project): JsonResponse
    {
        $project->delete();

        return response()->json(['message' => 'Project deleted.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:100'],
            'status' => ['required', 'in:planning,in_progress,review,completed,on_hold'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'deadline' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
        ]);
    }
}
