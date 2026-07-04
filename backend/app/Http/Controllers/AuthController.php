<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        // "admin@kml" is the short demo alias from the design handoff
        $email = strtolower(trim($data['email']));
        if ($email === 'admin@kml') {
            $email = 'karim@kmlproduction.com';
        }

        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials. Check your email and password.'],
            ]);
        }

        $user->forceFill(['last_active_at' => now()])->save();
        $token = $user->createToken('kml-admin')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): JsonResponse
    {
        $request->user()->forceFill(['last_active_at' => now()])->save();

        return response()->json($request->user());
    }
}
