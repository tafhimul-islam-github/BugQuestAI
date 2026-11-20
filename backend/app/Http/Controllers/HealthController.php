<?php

namespace App\Http\Controllers;

use App\Services\AiCoachService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class HealthController extends Controller
{
    public function check(): JsonResponse
    {
        $dbStatus = 'healthy';
        try {
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            $dbStatus = 'unhealthy: ' . $e->getMessage();
        }

        $aiStatus = AiCoachService::isOperational() ? 'healthy' : 'offline_using_pedagogical_fallback';

        return response()->json([
            'status' => ($dbStatus === 'healthy') ? 'operational' : 'degraded',
            'platform' => 'BugQuest AI',
            'version' => '1.0.0',
            'timestamp' => now()->toIso8601String(),
            'services' => [
                'database' => $dbStatus,
                'judge_engine' => env('JUDGE_PROVIDER', 'isolated_sandbox') . ' (active)',
                'ai_coaching_service' => $aiStatus,
            ],
        ]);
    }
}
