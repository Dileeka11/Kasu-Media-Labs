<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(Setting::instance());
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'studio_name' => ['required', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:255'],
            'email_on_inquiries' => ['required', 'boolean'],
            'auto_publish' => ['required', 'boolean'],
            'show_drafts' => ['required', 'boolean'],
        ]);

        $setting = Setting::instance();
        $setting->update($data);

        return response()->json($setting);
    }
}
