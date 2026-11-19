<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveUser
{
    /**
     * Block suspended accounts from accessing authenticated API endpoints.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->status === 'suspended') {
            return response()->json([
                'message' => 'Your account has been suspended. Please contact a platform administrator.',
                'reason' => $user->suspended_reason,
            ], 403);
        }

        return $next($request);
    }
}
