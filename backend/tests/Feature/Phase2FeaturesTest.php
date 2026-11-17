<?php

namespace Tests\Feature;

use App\Models\Challenge;
use App\Models\InterviewSession;
use App\Models\User;
use Tests\TestCase;

class Phase2FeaturesTest extends TestCase
{
    public function test_interview_session_creation_and_retrieval(): void
    {
        $interviewer = User::factory()->create(['role' => 'admin']);
        $challenge = Challenge::first();

        // 1. Create interview session
        $res = $this->actingAs($interviewer)->postJson('/api/interviews', [
            'challenge_id' => $challenge->id,
            'candidate_name' => 'Alice Rahman',
            'scheduled_at' => now()->toIso8601String(),
        ]);

        $res->assertStatus(201);
        $session = $res->json('session');

        $this->assertNotEmpty($session['session_code']);
        $this->assertStringStartsWith('BQ-INT-', $session['session_code']);
        $this->assertEquals('Alice Rahman', $session['candidate_name']);

        // 2. Retrieve public interview session by code
        $getRes = $this->getJson("/api/interviews/{$session['session_code']}");
        $getRes->assertStatus(200);
        $this->assertEquals($session['id'], $getRes->json('session.id'));
        $this->assertNotNull($getRes->json('session.challenge'));
    }

    public function test_interview_session_evaluation_sealing(): void
    {
        $interviewer = User::factory()->create(['role' => 'admin']);
        $challenge = Challenge::first();

        $session = InterviewSession::create([
            'session_code' => 'BQ-INT-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6)),
            'interviewer_id' => $interviewer->id,
            'challenge_id' => $challenge->id,
            'candidate_name' => 'Tariq Hassan',
            'status' => 'active',
        ]);

        $evalRes = $this->actingAs($interviewer)->postJson("/api/interviews/{$session->session_code}/evaluate", [
            'interviewer_notes' => 'Candidate demonstrated stellar comprehension of state invariants and race mitigation.',
            'evaluation_rubric' => [
                'problem_solving_score' => 95,
                'code_quality_score' => 90,
                'communication_score' => 92,
                'overall_verdict' => 'STRONG_HIRE',
            ],
            'status' => 'completed',
        ]);

        $evalRes->assertStatus(200);
        $updated = $evalRes->json('session');

        $this->assertEquals('completed', $updated['status']);
        $this->assertEquals(95, $updated['evaluation_rubric']['problem_solving_score']);
        $this->assertEquals('STRONG_HIRE', $updated['evaluation_rubric']['overall_verdict']);
    }

    public function test_byob_github_importer_requires_admin_authorization(): void
    {
        $learner = User::factory()->create(['role' => 'learner']);

        $res = $this->actingAs($learner)->postJson('/api/admin/challenges/import-github', [
            'repo_url' => 'https://github.com/facebook/react',
            'issue_description' => 'Concurrent rendering hook batching issue when updating suspense boundary.',
        ]);

        $res->assertStatus(403);
    }

    public function test_byob_github_importer_creates_sanitized_challenge_for_admin(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $res = $this->actingAs($admin)->postJson('/api/admin/challenges/import-github', [
            'repo_url' => 'https://github.com/expressjs/express',
            'issue_description' => 'Route matching fails when duplicate trailing slashes are present on parameterized nested routes.',
            'framework' => 'Node.js Express',
            'difficulty' => 'intermediate',
        ]);

        $res->assertStatus(201);
        $challenge = $res->json('challenge');

        $this->assertNotNull($challenge['id']);
        $this->assertNotEmpty($challenge['repository_files']);
        $this->assertStringContainsString('express', strtolower($challenge['title']) . strtolower($challenge['slug']));

        // Verify challenge exists in DB
        $this->assertDatabaseHas('challenges', [
            'id' => $challenge['id'],
            'difficulty' => 'intermediate',
        ]);
    }
}
