<?php

namespace Tests\Feature;

use App\Models\Challenge;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MultiFileDebuggingTest extends TestCase
{
    public function test_multi_file_challenge_retrieval_and_secrecy(): void
    {
        $challenge = Challenge::where('slug', 'cart-double-discount-bug')->firstOrFail();

        $response = $this->getJson("/api/challenges/{$challenge->slug}");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'challenge' => [
                'id',
                'slug',
                'title',
                'category',
                'framework',
                'investigation_time_minutes',
                'bug_report' => [
                    'issue_title',
                    'symptoms',
                    'expected_behavior',
                    'actual_behavior',
                    'reproduction_steps',
                ],
                'repository_files',
            ]
        ]);

        // Ensure reference_patch is NEVER leaked in public/learner response
        $this->assertArrayNotHasKey('reference_patch', $response->json('challenge'));
    }

    public function test_multi_file_unmodified_code_fails_reproduction_and_reference_patch_passes(): void
    {
        $user = User::factory()->create();
        $challenge = Challenge::where('slug', 'cart-double-discount-bug')->firstOrFail();

        // 1. Unmodified submission: should reproduce the defect (fail)
        $unmodifiedResponse = $this->actingAs($user)->postJson('/api/submissions', [
            'challenge_id' => $challenge->id,
            'language' => 'javascript',
            'modified_files' => [],
        ]);

        $unmodifiedResponse->assertStatus(201);
        $this->assertNotEquals('accepted', $unmodifiedResponse->json('submission.status'));

        // 2. Fixed submission using reference patch: should pass 100% of tests
        $fixedResponse = $this->actingAs($user)->postJson('/api/submissions', [
            'challenge_id' => $challenge->id,
            'language' => 'javascript',
            'modified_files' => $challenge->reference_patch,
            'hypothesis' => [
                'suspected_file' => 'src/cart.js',
                'root_cause' => 'Double deduction of discount on recalculate',
                'proposed_fix' => 'Set subtotal to raw total and total to raw minus discount',
            ],
            'patch_diff' => '--- a/src/cart.js\n+++ b/src/cart.js\n@@ -27,3 +27,3 @@',
        ]);

        $fixedResponse->assertStatus(201);
        $this->assertEquals('accepted', $fixedResponse->json('submission.status'));
        $this->assertGreaterThan(0, $fixedResponse->json('submission.pass_count'));
    }

    public function test_instructor_challenge_mutation_validation_endpoint(): void
    {
        $instructor = User::factory()->create(['role' => 'educator']);
        $challenge = Challenge::where('slug', 'cart-double-discount-bug')->firstOrFail();

        $response = $this->actingAs($instructor)->postJson("/api/admin/challenges/{$challenge->id}/validate");

        $response->assertStatus(200);
        $response->assertJson([
            'valid' => true,
            'defect_reproduced' => true,
            'reference_fix_passes' => true,
        ]);
    }

    public function test_all_seeded_challenges_reproduce_defect_and_pass_with_reference_patch(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $challenges = Challenge::whereNotNull('repository_files')
            ->where('slug', 'not like', 'byob-%')
            ->get();

        $this->assertGreaterThanOrEqual(10, $challenges->count(), 'At least 10 real-world debugging challenges must be seeded.');

        foreach ($challenges as $challenge) {
            $response = $this->actingAs($admin)->postJson("/api/admin/challenges/{$challenge->id}/validate");

            $response->assertStatus(200);
            $this->assertTrue(
                $response->json('defect_reproduced'),
                "Challenge [{$challenge->slug}] failed to reproduce the defect with starter code."
            );
            $this->assertTrue(
                $response->json('reference_fix_passes'),
                "Challenge [{$challenge->slug}] reference patch failed to pass 100% of test assertions."
            );
        }
    }
}
