<?php

namespace App\Http\Middleware;

use App\Models\AdminRequestLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogAdminRequest
{
    /**
     * Fields that must never be persisted to the audit log.
     */
    protected array $redact = [
        'password',
        'password_confirmation',
        'current_password',
        'token',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);

        $response = $next($request);

        $this->log($request, $response, $start);

        return $response;
    }

    protected function log(Request $request, Response $response, float $start): void
    {
        try {
            $user = $request->user();

            AdminRequestLog::create([
                'user_id'     => $user?->id,
                'user_name'   => $user?->name,
                'method'      => $request->method(),
                'path'        => '/'.ltrim($request->path(), '/'),
                'route'       => optional($request->route())->getActionName(),
                'status'      => $response->getStatusCode(),
                'ip'          => $request->ip(),
                'user_agent'  => substr((string) $request->userAgent(), 0, 255),
                'payload'     => $this->payload($request),
                'duration_ms' => (int) round((microtime(true) - $start) * 1000),
            ]);
        } catch (\Throwable $e) {
            // Never let audit logging break the request.
            report($e);
        }
    }

    protected function payload(Request $request): ?array
    {
        $data = $request->except($this->redact);

        // Don't store raw uploaded file contents.
        foreach ($request->allFiles() as $key => $file) {
            $data[$key] = '[file]';
        }

        return $data ?: null;
    }
}
