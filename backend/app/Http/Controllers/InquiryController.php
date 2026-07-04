<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Inquiry::latest()->get());
    }

    public function update(Request $request, Inquiry $inquiry): JsonResponse
    {
        $data = $request->validate([
            'unread' => ['required', 'boolean'],
        ]);

        $inquiry->update($data);

        return response()->json($inquiry);
    }

    public function destroy(Inquiry $inquiry): JsonResponse
    {
        $inquiry->delete();

        return response()->json(['message' => 'Inquiry deleted.']);
    }
}
