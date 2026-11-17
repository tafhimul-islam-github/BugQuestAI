<?php

namespace Tests\Feature;

use App\Models\Challenge;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdvancedFeaturesTest extends TestCase
{
    public function test_submission_records_telemetry_and_calculates_integrity_score(): void
    {
        $user = User::factory()->create(['role' => 'learner']);
        $challenge = Challenge::whereNotNull('repository_files')->first() ?? Challenge::first();

        $response = $this->actingAs($user)->postJson('/api/submissions', [
            'challenge_id' => $challenge->id,
            'language' => 'javascript',
            'code' => 'console.log("testing");',
            'telemetry' => [
                'keystrokes_count' => 120,
                'paste_events_count' => 1,
                'total_pasted_chars' => 30,
                'active_coding_ms' => 45000,
                'focus_lost_count' => 2,
            ],
        ]);

        $response->assertStatus(201);
        $submission = $response->json('submission');

        $this->assertNotNull($submission['telemetry']);
        $this->assertEquals(100, $submission['telemetry']['integrity_confidence_score']);
        $this->assertTrue($submission['telemetry']['is_verified_organic']);
    }

    public function test_challenge_post_mortem_evaluation_and_storage(): void
    {
        $user = User::factory()->create(['role' => 'learner']);
        $challenge = Challenge::first();

        $submission = Submission::create([
            'user_id' => $user->id,
            'challenge_id' => $challenge->id,
            'language' => 'javascript',
            'code' => 'function fix() {}',
            'status' => 'accepted',
            'pass_count' => 4,
            'total_count' => 4,
        ]);

        $response = $this->actingAs($user)->postJson("/api/challenges/{$challenge->id}/post-mortem", [
            'submission_id' => $submission->id,
            'root_cause_analysis' => 'The defect was triggered by a race condition during concurrent token refresh mutations.',
            'preventative_measures' => 'Introduce an atomic mutex lock in the critical section and add regression tests in CI.',
        ]);

        $response->assertStatus(201);
        $pm = $response->json('post_mortem');

        $this->assertGreaterThanOrEqual(70, $pm['score']);
        $this->assertNotNull($pm['feedback']);

        // Verify retrieval endpoint
        $getRes = $this->actingAs($user)->getJson("/api/challenges/{$challenge->id}/post-mortem");
        $getRes->assertStatus(200);
        $this->assertEquals($pm['id'], $getRes->json('post_mortem.id'));
    }

    public function test_chaos_monkey_stress_test_endpoint_on_accepted_submission(): void
    {
        $user = User::factory()->create(['role' => 'learner']);
        $challenge = Challenge::first();

        $submission = Submission::create([
            'user_id' => $user->id,
            'challenge_id' => $challenge->id,
            'language' => 'javascript',
            'code' => 'function fix() {}',
            'status' => 'accepted',
            'pass_count' => 4,
            'total_count' => 4,
        ]);

        $response = $this->actingAs($user)->postJson("/api/submissions/{$submission->id}/chaos-test");
        $response->assertStatus(200);

        $results = $response->json('chaos_results');
        $this->assertNotNull($results);
        $this->assertEquals('RESILIENT', $results['status']);
        $this->assertEquals(3, $results['total_mutations']);
        $this->assertEquals(3, $results['passed_mutations']);
    }

    public function test_challenge_exposes_apm_telemetry_traces(): void
    {
        $challenge = Challenge::whereNotNull('telemetry_traces')->first();

        if ($challenge) {
            $response = $this->getJson("/api/challenges/{$challenge->slug}");
            $response->assertStatus(200);

            $traces = $response->json('challenge.telemetry_traces');
            $this->assertNotNull($traces);
            $this->assertNotEmpty($traces['spans']);
            $this->assertNotNull($traces['trace_id']);
        }
    }
}
