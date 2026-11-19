<?php

namespace Database\Seeders;

use App\Models\Challenge;
use App\Models\ChallengeFeedback;
use App\Models\Classroom;
use App\Models\ClassroomAssignment;
use App\Models\User;
use App\Services\AuditService;
use App\Services\PlatformSettingService;
use Illuminate\Database\Seeder;

class PanelDataSeeder extends Seeder
{
    public function run(): void
    {
        PlatformSettingService::ensureDefaults();

        $educator = User::where('role', 'educator')->first();
        $admin = User::where('role', 'admin')->first();
        $learner = User::where('role', 'learner')->first();

        if ($educator) {
            // Assign existing unowned challenges to the seeded educator so they appear in Educator Studio
            Challenge::whereNull('author_id')->update(['author_id' => $educator->id]);
        }

        // Ensure existing active challenges have proper review/availability state
        Challenge::where('is_active', true)->update([
            'review_status' => Challenge::REVIEW_APPROVED,
            'availability_status' => Challenge::AVAILABILITY_PUBLISHED,
        ]);

        // Seed a pending-review challenge for moderation queue demo
        if ($educator && !Challenge::where('slug', 'webhook-signature-replay-guard')->exists()) {
            Challenge::create([
                'author_id' => $educator->id,
                'slug' => 'webhook-signature-replay-guard',
                'title' => 'Webhook Signature Replay Window Off-by-One',
                'difficulty' => 'intermediate',
                'category' => 'auth_security',
                'framework' => 'Node.js',
                'investigation_time_minutes' => 30,
                'description' => 'Payment webhooks with valid HMAC signatures are occasionally accepted outside the 5-minute replay window due to a unit mismatch between seconds and milliseconds.',
                'bug_report' => [
                    'issue_title' => 'Expired webhook payloads accepted by signature middleware',
                    'symptoms' => 'Security audit replayed a 10-minute-old webhook and received HTTP 200.',
                    'expected_behavior' => 'Payloads older than 300 seconds are rejected with 401.',
                    'actual_behavior' => 'Timestamp delta is compared in milliseconds against a 300-second threshold.',
                    'reproduction_steps' => [
                        '1. Send signed webhook with timestamp 600s in the past.',
                        '2. Observe middleware accepting the request.',
                    ],
                ],
                'starter_code' => [
                    'javascript' => "function isTimestampValid(headerTs, nowMs) {\n  return Math.abs(nowMs - headerTs) <= 300;\n}\nmodule.exports = { isTimestampValid };",
                ],
                'supported_languages' => ['javascript'],
                'topics' => ['security', 'webhooks', 'timestamps'],
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'is_active' => false,
                'review_status' => Challenge::REVIEW_PENDING,
                'availability_status' => Challenge::AVAILABILITY_UNPUBLISHED,
                'version' => 1,
            ]);
        }

        // Seed a sample classroom, learner enrollment, assignment, and feedback report
        if ($educator && $learner) {
            $classroom = Classroom::firstOrCreate(
                ['code' => 'BQ-CS301'],
                [
                    'educator_id' => $educator->id,
                    'name' => 'CS 301 — Production Debugging Lab',
                    'description' => 'Fall cohort focusing on root-cause analysis, concurrency defects, and API resilience.',
                    'is_active' => true,
                ]
            );

            $classroom->learners()->syncWithoutDetaching([
                $learner->id => ['enrolled_at' => now()],
            ]);

            $publishedChallenge = Challenge::where('availability_status', Challenge::AVAILABILITY_PUBLISHED)->first();
            if ($publishedChallenge) {
                ClassroomAssignment::firstOrCreate(
                    [
                        'classroom_id' => $classroom->id,
                        'challenge_id' => $publishedChallenge->id,
                    ],
                    [
                        'assigned_by' => $educator->id,
                        'due_at' => now()->addDays(7),
                        'note' => 'Complete the root-cause hypothesis and pass all regression tests.',
                    ]
                );

                ChallengeFeedback::firstOrCreate(
                    [
                        'challenge_id' => $publishedChallenge->id,
                        'reporter_id' => $learner->id,
                        'title' => 'Clarify edge-case input format in symptoms section',
                    ],
                    [
                        'assigned_educator_id' => $educator->id,
                        'category' => 'unclear_description',
                        'severity' => 'low',
                        'description' => 'The bug ticket mentions empty payloads, but it would help to clarify whether null or empty string is passed.',
                        'status' => 'open',
                    ]
                );
            }
        }

        if ($admin && \App\Models\AuditLog::count() === 0) {
            AuditService::record(
                $admin,
                'platform.initialized',
                'Initialized Admin & Educator governance controls and default platform settings',
                'platform_setting',
                null,
                ['phase' => '1-5']
            );
        }
    }
}
