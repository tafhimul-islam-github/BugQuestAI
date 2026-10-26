<?php

namespace Database\Seeders;

use App\Models\Challenge;
use App\Models\Recommendation;
use App\Models\SkillEvidence;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Database\Seeder;

class SkillEvidenceSeeder extends Seeder
{
    public function run(): void
    {
        $learner = User::where('email', 'learner@bugquest.ai')->first();
        if (!$learner) return;

        $twoSum = Challenge::where('slug', 'two-sum-target-finder')->first();
        $palindrome = Challenge::where('slug', 'valid-palindrome-sanitizer')->first();
        $brackets = Challenge::where('slug', 'balanced-brackets-validator')->first();

        // Seed an accepted submission for Two Sum
        if ($twoSum) {
            Submission::create([
                'user_id' => $learner->id,
                'challenge_id' => $twoSum->id,
                'language' => 'javascript',
                'code' => $twoSum->starter_code['javascript'],
                'status' => 'accepted',
                'pass_count' => 5,
                'total_count' => 5,
                'execution_time_ms' => 45.2,
                'memory_kb' => 18400,
                'public_test_results' => [
                    ['test_case_id' => 1, 'status' => 'passed', 'execution_time_ms' => 42.0],
                    ['test_case_id' => 2, 'status' => 'passed', 'execution_time_ms' => 48.4],
                ],
                'judge_provider' => 'isolated_sandbox',
            ]);
        }

        // Seed a submission with error for Palindrome (so the learner can see realistic history)
        if ($palindrome) {
            Submission::create([
                'user_id' => $learner->id,
                'challenge_id' => $palindrome->id,
                'language' => 'javascript',
                'code' => "const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf-8').trim();\nconsole.log(s === s.split('').reverse().join(''));",
                'status' => 'wrong_answer',
                'pass_count' => 1,
                'total_count' => 5,
                'execution_time_ms' => 52.1,
                'memory_kb' => 18600,
                'error_output' => 'Expected true for "A man, a plan, a canal: Panama", but got false.',
                'public_test_results' => [
                    ['test_case_id' => 1, 'status' => 'failed', 'error' => 'Output: false, Expected: true'],
                    ['test_case_id' => 2, 'status' => 'passed'],
                ],
                'judge_provider' => 'isolated_sandbox',
            ]);
        }

        // Seed Skill Evidence across topics
        $topics = [
            [
                'topic' => 'arrays',
                'proficiency_level' => 'demonstrating_progress',
                'score' => 74,
                'challenges_attempted' => 3,
                'challenges_passed' => 2,
                'total_submissions' => 5,
                'consecutive_passes' => 2,
                'hints_requested_count' => 1,
                'diagnostic_history' => [
                    ['date' => '2026-10-24', 'challenge' => 'two-sum-target-finder', 'result' => 'accepted'],
                    ['date' => '2026-10-25', 'challenge' => 'missing-number-in-array', 'result' => 'accepted'],
                ],
                'last_assessed_at' => now()->subDay(),
            ],
            [
                'topic' => 'hash_maps',
                'proficiency_level' => 'consistent',
                'score' => 88,
                'challenges_attempted' => 2,
                'challenges_passed' => 2,
                'total_submissions' => 3,
                'consecutive_passes' => 2,
                'hints_requested_count' => 0,
                'diagnostic_history' => [
                    ['date' => '2026-10-24', 'challenge' => 'two-sum-target-finder', 'result' => 'accepted'],
                ],
                'last_assessed_at' => now()->subHours(12),
            ],
            [
                'topic' => 'strings',
                'proficiency_level' => 'developing',
                'score' => 45,
                'challenges_attempted' => 2,
                'challenges_passed' => 0,
                'total_submissions' => 3,
                'consecutive_passes' => 0,
                'hints_requested_count' => 3,
                'diagnostic_history' => [
                    ['date' => '2026-10-25', 'challenge' => 'valid-palindrome-sanitizer', 'result' => 'wrong_answer'],
                ],
                'last_assessed_at' => now()->subHours(6),
            ],
            [
                'topic' => 'stacks',
                'proficiency_level' => 'developing',
                'score' => 30,
                'challenges_attempted' => 1,
                'challenges_passed' => 0,
                'total_submissions' => 1,
                'consecutive_passes' => 0,
                'hints_requested_count' => 2,
                'diagnostic_history' => [],
                'last_assessed_at' => null,
            ]
        ];

        foreach ($topics as $t) {
            SkillEvidence::updateOrCreate(
                ['user_id' => $learner->id, 'topic' => $t['topic']],
                $t
            );
        }

        // Seed personalized recommendations
        if ($palindrome) {
            Recommendation::updateOrCreate(
                ['user_id' => $learner->id, 'challenge_id' => $palindrome->id],
                [
                    'reason' => 'Your last attempt failed on non-alphanumeric character filtering. Practicing string sanitization will boost your Strings & Two Pointers score.',
                    'topic' => 'strings',
                    'status' => 'pending',
                ]
            );
        }

        if ($brackets) {
            Recommendation::updateOrCreate(
                ['user_id' => $learner->id, 'challenge_id' => $brackets->id],
                [
                    'reason' => 'Next recommended challenge in your Data Structures path. Strengthens LIFO parsing and nested state management.',
                    'topic' => 'stacks',
                    'status' => 'pending',
                ]
            );
        }
    }
}
