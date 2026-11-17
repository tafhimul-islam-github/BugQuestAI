<?php

namespace Tests\Feature;

use App\Models\Challenge;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BugQuestAssessmentTest extends TestCase
{
    public function test_user_can_register_and_authenticate(): void
    {
        $uniqueEmail = 'newlearner_' . uniqid() . '@bugquest.ai';

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Taylor Swift',
            'email' => $uniqueEmail,
            'password' => 'supersecret123',
            'role' => 'learner',
            'target_role' => 'Frontend Engineer',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'role'],
                'token',
            ]);

        $token = $response->json('token');

        // Test auth/me with bearer token
        $meResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me');

        $meResponse->assertStatus(200)
            ->assertJsonPath('user.email', $uniqueEmail);
    }

    public function test_challenges_list_and_hidden_test_cases_protection(): void
    {
        $response = $this->getJson('/api/challenges');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'challenges' => [
                    '*' => ['id', 'slug', 'title', 'difficulty', 'topics', 'is_solved']
                ],
                'topics',
                'total'
            ]);

        $twoSum = Challenge::where('slug', 'two-sum-target-finder')->first();
        $this->assertNotNull($twoSum);

        $detailResponse = $this->getJson("/api/challenges/{$twoSum->slug}");
        $detailResponse->assertStatus(200)
            ->assertJsonStructure([
                'challenge' => [
                    'id', 'slug', 'title', 'difficulty', 'description', 'public_test_cases'
                ]
            ]);

        // CRITICAL SECURITY ASSERTION: Hidden tests must NEVER be returned in public_test_cases
        $publicTests = $detailResponse->json('challenge.public_test_cases');
        $this->assertNotEmpty($publicTests);

        foreach ($publicTests as $pt) {
            $this->assertArrayNotHasKey('is_hidden', $pt);
            // Verify none of the public test cases are from hidden test cases
            $dbTc = $twoSum->testCases()->find($pt['id']);
            $this->assertFalse((bool) $dbTc->is_hidden, "Hidden test case was leaked to public response!");
        }
    }

    public function test_code_submission_executes_and_updates_skill_evidence(): void
    {
        $user = User::where('email', 'learner@bugquest.ai')->first();
        $challenge = Challenge::where('slug', 'two-sum-target-finder')->first();

        $token = $user->createToken('test_token')->plainTextToken;

        // Solution code for JavaScript Two Sum
        $validCode = "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length < 2) process.exit(0);\nconst nums = input[0].split(',').map(Number);\nconst target = Number(input[1]);\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}\nconsole.log(JSON.stringify(twoSum(nums, target)));";

        $subResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/submissions', [
                'challenge_id' => $challenge->id,
                'language' => 'javascript',
                'code' => $validCode,
            ]);

        $subResponse->assertStatus(201)
            ->assertJsonPath('submission.status', 'accepted')
            ->assertJsonPath('submission.pass_count', 5)
            ->assertJsonPath('submission.total_count', 5);

        // Verify SkillEvidence was created or updated for topic 'arrays'
        $this->assertDatabaseHas('skill_evidence', [
            'user_id' => $user->id,
            'topic' => 'arrays',
        ]);
    }

    public function test_ai_coach_hint_progressive_levels(): void
    {
        $user = User::where('email', 'learner@bugquest.ai')->first();
        $challenge = Challenge::where('slug', 'two-sum-target-finder')->first();
        $token = $user->createToken('hint_token')->plainTextToken;

        // Request Nudge
        $nudgeRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/ai/hint', [
                'challenge_id' => $challenge->id,
                'hint_level' => 'nudge',
                'language' => 'javascript',
                'code' => 'function twoSum() { return []; }',
            ]);

        $nudgeRes->assertStatus(200)
            ->assertJsonPath('hint.hint_level', 'nudge')
            ->assertJsonStructure([
                'hint' => ['id', 'hint_level', 'summary', 'explanation', 'next_steps', 'confidence']
            ]);

        // Request Direction
        $dirRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/ai/hint', [
                'challenge_id' => $challenge->id,
                'hint_level' => 'direction',
                'language' => 'javascript',
                'code' => 'function twoSum() { return []; }',
            ]);

        $dirRes->assertStatus(200)
            ->assertJsonPath('hint.hint_level', 'direction');
    }

    public function test_readiness_report_and_share_token_revocation_lifecycle(): void
    {
        $user = User::where('email', 'learner@bugquest.ai')->first();
        $token = $user->createToken('report_token')->plainTextToken;

        // 1. Generate Report
        $genRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/reports/generate');

        $genRes->assertStatus(201)
            ->assertJsonStructure([
                'report' => ['id', 'report_uuid', 'title', 'overall_readiness_score', 'readiness_level', 'summary']
            ]);

        $reportUuid = $genRes->json('report.report_uuid');

        // 2. Create Share Token with explicit consent
        $shareRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/reports/{$reportUuid}/share", [
                'allow_diagnostics' => true,
                'allow_code_samples' => false,
                'expires_days' => 14,
            ]);

        $shareRes->assertStatus(201);
        $shareToken = $shareRes->json('share_token');
        $this->assertNotEmpty($shareToken);

        // 3. Public access via valid share token
        $publicRes = $this->getJson("/api/reports/shared/{$shareToken}");
        $publicRes->assertStatus(200)
            ->assertJsonStructure([
                'shared_report' => [
                    'title', 'candidate_name', 'overall_readiness_score', 'summary', 'methodology_notes', 'limitations_disclaimer'
                ]
            ]);

        // 4. Revoke Share Token
        $revokeRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/reports/share/{$shareToken}/revoke");
        $revokeRes->assertStatus(200);

        // 5. Verify Revoked Share Token now returns 404
        $revokedAccessRes = $this->getJson("/api/reports/shared/{$shareToken}");
        $revokedAccessRes->assertStatus(404);
    }

    public function test_own_accepted_code_in_history_and_community_submissions_hide_solution_code(): void
    {
        $learner = User::where('email', 'learner@bugquest.ai')->first();
        $challenge = Challenge::where('slug', 'two-sum-target-finder')->first();
        $token = $learner->createToken('history_token')->plainTextToken;

        $solutionCode = "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length < 2) process.exit(0);\nconst nums = input[0].split(',').map(Number);\nconst target = Number(input[1]);\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}\nconsole.log(JSON.stringify(twoSum(nums, target)));";

        // 1. Learner submits solution
        $subRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/submissions', [
                'challenge_id' => $challenge->id,
                'language' => 'javascript',
                'code' => $solutionCode,
            ]);
        $subRes->assertStatus(201);

        // 2. Learner re-opens the challenge: user_submissions MUST include their own submitted code
        $reopenRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/challenges/{$challenge->slug}");
        $reopenRes->assertStatus(200);

        $userSubs = $reopenRes->json('challenge.user_submissions');
        $this->assertNotEmpty($userSubs);
        $this->assertEquals($solutionCode, $userSubs[0]['code']);

        // 3. Community submissions feed MUST list submissions for the problem but NEVER expose solution code
        $commSubs = $reopenRes->json('challenge.community_submissions');
        $this->assertNotEmpty($commSubs);
        foreach ($commSubs as $cs) {
            $this->assertArrayNotHasKey('code', $cs, 'Community submission leaked solution code!');
            $this->assertArrayNotHasKey('modified_files', $cs, 'Community submission leaked modified_files!');
            $this->assertArrayNotHasKey('patch_diff', $cs, 'Community submission leaked patch_diff!');
            $this->assertArrayHasKey('user_name', $cs);
            $this->assertArrayHasKey('status', $cs);
            $this->assertArrayHasKey('pass_count', $cs);
        }
    }
}
