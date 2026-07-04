<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Lead::latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json(Lead::create($this->validated($request)), 201);
    }

    public function update(Request $request, Lead $lead): JsonResponse
    {
        $lead->update($this->validated($request));

        return response()->json($lead);
    }

    public function destroy(Lead $lead): JsonResponse
    {
        $lead->delete();

        return response()->json(['message' => 'Lead deleted.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'source' => ['required', 'string', 'max:50'],
            'service_interest' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:new,contacted,qualified,converted,lost'],
            'message' => ['nullable', 'string'],
        ]);
    }
}
