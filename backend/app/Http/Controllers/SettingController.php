<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SettingController extends Controller
{
    public const FONTS = [
        'Manrope', 'Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
        'Nunito Sans', 'Raleway', 'Work Sans', 'DM Sans', 'Plus Jakarta Sans', 'Sora',
        'Outfit', 'Rubik', 'IBM Plex Sans', 'Space Grotesk', 'Playfair Display',
        'Lora', 'Merriweather', 'Space Mono', 'System',
    ];

    public function show(): JsonResponse
    {
        return response()->json(Setting::instance());
    }

    public function update(Request $request): JsonResponse
    {
        // Every field is optional so each setting (font, a toggle, the profile)
        // can be saved on its own — an unrelated field can never block the save.
        $data = $request->validate([
            'studio_name' => ['sometimes', 'required', 'string', 'max:255'],
            'contact_email' => ['sometimes', 'required', 'email', 'max:255'],
            'font' => ['sometimes', 'required', 'string', Rule::in(self::FONTS)],
            'email_on_inquiries' => ['sometimes', 'required', 'boolean'],
            'auto_publish' => ['sometimes', 'required', 'boolean'],
            'show_drafts' => ['sometimes', 'required', 'boolean'],
        ]);

        $setting = Setting::instance();
        $setting->update($data);

        return response()->json($setting);
    }
}
