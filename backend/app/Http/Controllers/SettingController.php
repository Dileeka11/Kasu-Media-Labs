<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        // Every field is optional so each setting can be saved on its own — an
        // unrelated field can never block the save.
        $data = $request->validate([
            'studio_name' => ['sometimes', 'required', 'string', 'max:255'],
            'contact_email' => ['sometimes', 'required', 'email', 'max:255'],
            'font' => ['sometimes', 'required', 'string', Rule::in(self::FONTS)],
            'email_on_inquiries' => ['sometimes', 'required', 'boolean'],
            'auto_publish' => ['sometimes', 'required', 'boolean'],
            'show_drafts' => ['sometimes', 'required', 'boolean'],

            'showreel_url' => ['sometimes', 'nullable', 'string', 'max:500'],

            // Hero copy
            'hero_kicker' => ['sometimes', 'nullable', 'string', 'max:255'],
            'hero_headline' => ['sometimes', 'nullable', 'string', 'max:255'],
            'hero_subheadline' => ['sometimes', 'nullable', 'string', 'max:500'],

            // Contact
            'phone' => ['sometimes', 'nullable', 'string', 'max:100'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],

            // Socials
            'socials' => ['sometimes', 'nullable', 'array'],
            'socials.instagram' => ['nullable', 'string', 'max:255'],
            'socials.youtube' => ['nullable', 'string', 'max:255'],
            'socials.vimeo' => ['nullable', 'string', 'max:255'],
            'socials.linkedin' => ['nullable', 'string', 'max:255'],

            // Stats
            'stats' => ['sometimes', 'nullable', 'array', 'max:6'],
            'stats.*.value' => ['required', 'string', 'max:20'],
            'stats.*.label' => ['required', 'string', 'max:60'],

            // Clients
            'clients' => ['sometimes', 'nullable', 'array', 'max:40'],
            'clients.*.name' => ['nullable', 'string', 'max:80'],
            'clients.*.logo' => ['nullable', 'string', 'max:500'],

            // Testimonials
            'testimonials' => ['sometimes', 'nullable', 'array', 'max:20'],
            'testimonials.*.quote' => ['required', 'string', 'max:600'],
            'testimonials.*.author' => ['required', 'string', 'max:120'],
            'testimonials.*.role' => ['nullable', 'string', 'max:120'],
        ]);

        $setting = Setting::instance();
        $setting->update($data);

        return response()->json($setting);
    }

    /**
     * Upload the brand logo and/or the hero background video.
     * Multipart PUT is unreliable in PHP, so uploads use their own POST endpoint.
     */
    public function media(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => ['sometimes', 'image', 'max:4096'],
            'hero_video' => ['sometimes', 'mimetypes:video/mp4,video/webm,video/quicktime', 'max:51200'],
        ]);

        $setting = Setting::instance();

        foreach (['logo', 'hero_video'] as $field) {
            if (! $request->hasFile($field)) {
                continue;
            }
            if ($setting->{$field}) {
                Storage::disk('public')->delete($setting->{$field});
            }
            $folder = $field === 'logo' ? 'branding' : 'hero';
            $setting->{$field} = $request->file($field)->store($folder, 'public');
        }

        $setting->save();

        return response()->json($setting);
    }

    /**
     * Upload a single client brand logo and return its public URL. The URL is
     * stored directly on the client item (via the normal settings save), which
     * keeps the JSON array self-contained. An optional `old` URL is deleted so
     * replacing a logo doesn't leave the previous file orphaned.
     */
    public function clientLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => ['required', 'image', 'max:4096'],
            'old' => ['nullable', 'string', 'max:500'],
        ]);

        if ($old = $request->input('old')) {
            $prefix = asset('storage/');
            if (str_starts_with($old, $prefix)) {
                Storage::disk('public')->delete(ltrim(substr($old, strlen($prefix)), '/'));
            }
        }

        $path = $request->file('logo')->store('clients', 'public');

        return response()->json(['url' => asset('storage/'.$path)]);
    }

    /** Remove an uploaded logo or hero video. */
    public function clearMedia(Request $request): JsonResponse
    {
        $data = $request->validate([
            'field' => ['required', Rule::in(['logo', 'hero_video'])],
        ]);

        $setting = Setting::instance();
        $field = $data['field'];

        if ($setting->{$field}) {
            Storage::disk('public')->delete($setting->{$field});
            $setting->{$field} = null;
            $setting->save();
        }

        return response()->json($setting);
    }
}
