<?php

namespace Database\Seeders;

use App\Models\Challenge;
use Illuminate\Database\Seeder;

class TelemetryTraceSeeder extends Seeder
{
    public function run(): void
    {
        $challenges = Challenge::all();

        foreach ($challenges as $challenge) {
            $slug = $challenge->slug;
            $traceId = 'tr-' . substr(md5($slug), 0, 16);
            $serviceName = strtolower(str_replace(['_', '-'], '', $challenge->category)) . '-svc';

            $spans = [
                [
                    'id' => 'span-gw-1',
                    'parent_id' => null,
                    'service' => 'api-gateway',
                    'name' => 'HTTP INGRESS: ' . strtoupper($challenge->framework ?? 'NODE') . ' /api/v1/' . $slug,
                    'start_time_offset_ms' => 0,
                    'duration_ms' => 840.5,
                    'status' => 'error',
                    'http_status' => 500,
                    'tags' => [
                        'http.method' => 'POST',
                        'net.peer.ip' => '10.0.4.118',
                        'telemetry.sdk.language' => 'opentelemetry-w3c',
                    ],
                ],
                [
                    'id' => 'span-auth-2',
                    'parent_id' => 'span-gw-1',
                    'service' => 'identity-provider',
                    'name' => 'JWT Session & Scope Inspection',
                    'start_time_offset_ms' => 8.2,
                    'duration_ms' => 24.1,
                    'status' => 'ok',
                    'http_status' => 200,
                    'tags' => [
                        'auth.type' => 'Bearer token',
                        'crypto.algorithm' => 'Ed25519',
                    ],
                ],
                [
                    'id' => 'span-core-3',
                    'parent_id' => 'span-gw-1',
                    'service' => $serviceName,
                    'name' => 'ExecutionHandler.' . camel_case_identifier($slug),
                    'start_time_offset_ms' => 38.0,
                    'duration_ms' => 610.2,
                    'status' => 'error',
                    'http_status' => 500,
                    'error_event' => [
                        'type' => 'ProductionDefectTriggered',
                        'message' => $challenge->bug_report['symptoms'] ?? 'Invariant assertion failure detected in service layer',
                        'stack' => 'at ServiceHandler.run (src/index.js:34:11)\n    at Object.evaluate (entrypoint.js:12:4)',
                    ],
                    'tags' => [
                        'category' => $challenge->category,
                        'difficulty' => $challenge->difficulty,
                        'db.system' => 'distributed_kv_store',
                    ],
                ],
                [
                    'id' => 'span-sub-4',
                    'parent_id' => 'span-core-3',
                    'service' => $serviceName . '-db',
                    'name' => 'Transaction::commitWithIsolation',
                    'start_time_offset_ms' => 95.0,
                    'duration_ms' => 340.0,
                    'status' => 'error',
                    'tags' => [
                        'isolation.level' => 'SERIALIZABLE',
                        'conflict.reason' => 'Idempotency key collision or state mutation race condition',
                    ],
                ],
                [
                    'id' => 'span-downstream-5',
                    'parent_id' => 'span-gw-1',
                    'service' => 'notification-publisher',
                    'name' => 'KafkaMessageProducer.emitAuditRecord',
                    'start_time_offset_ms' => 660.0,
                    'duration_ms' => 170.0,
                    'status' => 'cancelled',
                    'tags' => [
                        'kafka.topic' => 'telemetry.system.errors',
                        'publish.state' => 'circuit_breaker_opened',
                    ],
                ],
            ];

            $challenge->update([
                'telemetry_traces' => [
                    'trace_id' => $traceId,
                    'root_service' => 'api-gateway',
                    'total_duration_ms' => 840.5,
                    'error_count' => 3,
                    'warning_count' => 1,
                    'spans' => $spans,
                ],
            ]);
        }
    }
}

function camel_case_identifier(string $string): string
{
    $words = explode('-', str_replace('_', '-', $string));
    $camel = '';
    foreach ($words as $i => $word) {
        $camel .= $i === 0 ? strtolower($word) : ucfirst(strtolower($word));
    }
    return $camel ?: 'execute';
}
