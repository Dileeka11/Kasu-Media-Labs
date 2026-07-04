<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Project::with('category')->orderByDesc('published_at')->orderByDesc('id')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['thumbnail'] = $this->storeThumbnail($request);
        $data['published_at'] = $data['status'] === 'published' ? now()->toDateString() : null;

        $project = Project::create($data);
        Activity::log("\u{201C}{$project->title}\u{201D} ".($project->status === 'published' ? 'published' : 'created'), 'by '.$request->user()->name);

        return response()->json($project->load('category'), 201);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $data = $this->validated($request);

        if ($thumb = $this->storeThumbnail($request)) {
            if ($project->thumbnail) {
                Storage::disk('public')->delete($project->thumbnail);
            }
            $data['thumbnail'] = $thumb;
        }

        if ($data['status'] === 'published' && ! $project->published_at) {
            $data['published_at'] = now()->toDateString();
        }

        $statusChanged = $project->status !== $data['status'];
        $project->update($data);

        if ($statusChanged) {
            Activity::log("\u{201C}{$project->title}\u{201D} moved to ".ucfirst($project->status), 'by '.$request->user()->name);
        }

        return response()->json($project->load('category'));
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        if ($project->thumbnail) {
            Storage::disk('public')->delete($project->thumbnail);
        }
        $project->delete();
        Activity::log("\u{201C}{$project->title}\u{201D} deleted", 'by '.$request->user()->name);

        return response()->json(['message' => 'Project deleted.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'client' => ['nullable', 'string', 'max:255'],
            'video_url' => ['nullable', 'url', 'max:500'],
            'duration' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'in:published,draft,review'],
        ]);
    }

    private function storeThumbnail(Request $request): ?string
    {
        if (! $request->hasFile('thumbnail')) {
            return null;
        }

        $request->validate([
            'thumbnail' => ['image', 'max:4096'],
        ]);

        return $request->file('thumbnail')->store('thumbnails', 'public');
    }
}
