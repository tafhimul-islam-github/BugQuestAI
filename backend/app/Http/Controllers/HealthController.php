<?php

namespace App\Http\Controllers;

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

        $aiStatus = 'offline';
        try {
            $aiRes = Http::timeout(2)->get(env('AI_SERVICE_URL', 'http://localhost:8001') . '/health');
            if ($aiRes->successful()) {
                $aiStatus = 'healthy';
            }
        } catch (\Exception $e) {
            $aiStatus = 'offline_using_pedagogical_fallback';
        }

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
