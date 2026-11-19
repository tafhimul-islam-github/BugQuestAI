<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Challenge;
use App\Models\ChallengeFeedback;
use App\Models\Classroom;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminEducatorPanelTest extends TestCase
{
    use DatabaseTransactions;

    private User $admin;
    private User $educator;
    private User $otherEducator;
    private User $learner;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.local',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->educator = User::create([
            'name' => 'Educator One',
            'email' => 'educator1@test.local',
            'password' => Hash::make('password123'),
            'role' => 'educator',
            'status' => 'active',
        ]);

        $this->otherEducator = User::create([
            'name' => 'Educator Two',
            'email' => 'educator2@test.local',
            'password' => Hash::make('password123'),
            'role' => 'educator',
            'status' => 'active',
        ]);

        $this->learner = User::create([
            'name' => 'Learner One',
            'email' => 'learner1@test.local',
            'password' => Hash::make('password123'),
            'role' => 'learner',
            'status' => 'active',
        ]);
    }

    public function test_role_boundaries_are_enforced_on_backend(): void
    {
        // Learner cannot access educator or admin panels
        $this->actingAs($this->learner)->getJson('/api/educator/overview')->assertStatus(403);
        $this->actingAs($this->learner)->getJson('/api/admin/overview')->assertStatus(403);

        // Educator can access educator panel, but NOT admin governance endpoints
        $this->actingAs($this->educator)->getJson('/api/educator/overview')->assertStatus(200);
        $this->actingAs($this->educator)->getJson('/api/admin/overview')->assertStatus(403);
        $this->actingAs($this->educator)->getJson('/api/admin/users')->assertStatus(403);
        $this->actingAs($this->educator)->getJson('/api/admin/settings')->assertStatus(403);

        // Admin can access both
        $this->actingAs($this->admin)->getJson('/api/admin/overview')->assertStatus(200);
        $this->actingAs($this->admin)->getJson('/api/educator/overview')->assertStatus(200);
    }

    public function test_full_challenge_review_publish_edit_re_review_and_disable_lifecycle(): void
    {
        // 1. Educator creates a draft challenge (never published automatically)
        $createRes = $this->actingAs($this->educator)->postJson('/api/educator/challenges', [
            'title' => 'Cache Stampede Lock Leak',
            'difficulty' => 'intermediate',
            'category' => 'concurrency_race',
            'framework' => 'Node.js',
            'description' => 'Redis mutex is not released on thrown exceptions.',
            'starter_code' => ['javascript' => 'function run() { return false; }'],
            'test_cases' => [
                ['input' => '1', 'expected_output' => 'true', 'is_hidden' => false],
            ],
        ]);

        $createRes->assertStatus(201);
        $challengeId = $createRes->json('challenge.id');
        $this->assertEquals('draft', $createRes->json('challenge.review_status'));
        $this->assertEquals('unpublished', $createRes->json('challenge.availability_status'));
        $this->assertFalse($createRes->json('challenge.is_active'));

        // Public learner cannot see unpublished draft
        $this->actingAs($this->learner)->getJson("/api/challenges/{$challengeId}")->assertStatus(404);

        // Another educator cannot edit someone else's challenge
        $this->actingAs($this->otherEducator)->putJson("/api/educator/challenges/{$challengeId}", [
            'title' => 'Hijacked Title',
        ])->assertStatus(403);

        // 2. Educator validates and submits for review
        $this->actingAs($this->educator)->postJson("/api/educator/challenges/{$challengeId}/validate")
            ->assertStatus(200)
            ->assertJsonPath('valid', true);

        $this->actingAs($this->educator)->postJson("/api/educator/challenges/{$challengeId}/submit-review")
            ->assertStatus(200)
            ->assertJsonPath('challenge.review_status', 'pending_review');

        // Educator cannot self-approve or publish
        $this->actingAs($this->educator)->postJson("/api/admin/challenges/{$challengeId}/approve")->assertStatus(403);
        $this->actingAs($this->educator)->postJson("/api/admin/challenges/{$challengeId}/publish")->assertStatus(403);

        // Admin cannot publish before approving
        $this->actingAs($this->admin)->postJson("/api/admin/challenges/{$challengeId}/publish")->assertStatus(422);

        // 3. Admin requests changes with reason
        $this->actingAs($this->admin)->postJson("/api/admin/challenges/{$challengeId}/request-changes", [
            'review_notes' => 'Add clearer reproduction steps for timeout scenario.',
        ])->assertStatus(200)->assertJsonPath('challenge.review_status', 'changes_requested');

        // Educator updates & resubmits
        $this->actingAs($this->educator)->putJson("/api/educator/challenges/{$challengeId}", [
            'description' => 'Updated description with timeout reproduction details.',
        ])->assertStatus(200);

        $this->actingAs($this->educator)->postJson("/api/educator/challenges/{$challengeId}/submit-review")
            ->assertStatus(200)
            ->assertJsonPath('challenge.review_status', 'pending_review');

        // 4. Admin approves (still NOT published yet!)
        $this->actingAs($this->admin)->postJson("/api/admin/challenges/{$challengeId}/approve")
            ->assertStatus(200)
            ->assertJsonPath('challenge.review_status', 'approved')
            ->assertJsonPath('challenge.availability_status', 'unpublished');

        // 5. Admin publishes
        $this->actingAs($this->admin)->postJson("/api/admin/challenges/{$challengeId}/publish")
            ->assertStatus(200)
            ->assertJsonPath('challenge.availability_status', 'published')
            ->assertJsonPath('challenge.is_active', true);

        // Now learner can view it
        $this->actingAs($this->learner)->getJson("/api/challenges/{$challengeId}")->assertStatus(200);

        // 6. Editing a published challenge creates a version snapshot & triggers re-review
        $editRes = $this->actingAs($this->educator)->putJson("/api/educator/challenges/{$challengeId}", [
            'description' => 'Fixed typo in edge case note.',
            'change_summary' => 'Clarified edge case note',
        ]);
        $editRes->assertStatus(200)
            ->assertJsonPath('challenge.version', 2)
            ->assertJsonPath('challenge.review_status', 'pending_review');

        $this->assertDatabaseHas('challenge_versions', [
            'challenge_id' => $challengeId,
            'version_number' => 1,
        ]);

        // 7. Admin disables challenge (preserves submissions) and restores it
        Submission::create([
            'user_id' => $this->learner->id,
            'challenge_id' => $challengeId,
            'language' => 'javascript',
            'code' => 'console.log("test")',
            'status' => 'accepted',
            'pass_count' => 1,
            'total_count' => 1,
        ]);

        $this->actingAs($this->admin)->postJson("/api/admin/challenges/{$challengeId}/disable")
            ->assertStatus(200)
            ->assertJsonPath('challenge.availability_status', 'disabled');

        $this->assertDatabaseHas('submissions', ['challenge_id' => $challengeId, 'user_id' => $this->learner->id]);

        $this->actingAs($this->admin)->postJson("/api/admin/challenges/{$challengeId}/archive")
            ->assertStatus(200)
            ->assertJsonPath('challenge.availability_status', 'archived');

        $this->actingAs($this->admin)->postJson("/api/admin/challenges/{$challengeId}/restore")
            ->assertStatus(200)
            ->assertJsonPath('challenge.availability_status', 'unpublished');
    }

    public function test_admin_user_management_suspension_and_audit_logging(): void
    {
        // Admin changes learner role to educator
        $this->actingAs($this->admin)->patchJson("/api/admin/users/{$this->learner->id}/role", [
            'role' => 'educator',
        ])->assertStatus(200)->assertJsonPath('user.role', 'educator');

        // Revert back to learner
        $this->actingAs($this->admin)->patchJson("/api/admin/users/{$this->learner->id}/role", [
            'role' => 'learner',
        ])->assertStatus(200);

        // Admin cannot demote or suspend self
        $this->actingAs($this->admin)->patchJson("/api/admin/users/{$this->admin->id}/role", [
            'role' => 'learner',
        ])->assertStatus(422);

        $this->actingAs($this->admin)->patchJson("/api/admin/users/{$this->admin->id}/status", [
            'status' => 'suspended',
        ])->assertStatus(422);

        // Admin views learner history -> must create learner.record_accessed audit log
        $this->actingAs($this->admin)->getJson("/api/admin/users/{$this->learner->id}/history")
            ->assertStatus(200)
            ->assertJsonStructure(['user', 'audit_events', 'recent_submissions']);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $this->admin->id,
            'action' => 'learner.record_accessed',
            'target_id' => $this->learner->id,
        ]);

        // Admin suspends learner -> suspended user cannot log in or call authenticated endpoints
        $this->actingAs($this->admin)->patchJson("/api/admin/users/{$this->learner->id}/status", [
            'status' => 'suspended',
            'reason' => 'Policy review',
        ])->assertStatus(200)->assertJsonPath('user.status', 'suspended');

        $this->postJson('/api/auth/login', [
            'email' => $this->learner->email,
            'password' => 'password123',
        ])->assertStatus(403);

        // Reactivate
        $this->actingAs($this->admin)->patchJson("/api/admin/users/{$this->learner->id}/status", [
            'status' => 'active',
        ])->assertStatus(200)->assertJsonPath('user.status', 'active');
    }

    public function test_feedback_inbox_and_educator_classrooms_scoped_progress(): void
    {
        $challenge = Challenge::create([
            'author_id' => $this->educator->id,
            'slug' => 'published-quest-1',
            'title' => 'Published Quest 1',
            'difficulty' => 'beginner',
            'description' => 'Fix off by one',
            'is_active' => true,
            'review_status' => Challenge::REVIEW_APPROVED,
            'availability_status' => Challenge::AVAILABILITY_PUBLISHED,
            'published_at' => now(),
            'version' => 1,
        ]);

        // Learner submits feedback
        $fbRes = $this->actingAs($this->learner)->postJson("/api/challenges/{$challenge->id}/feedback", [
            'category' => 'broken_test',
            'severity' => 'high',
            'title' => 'Test 2 expects trailing newline',
            'description' => 'Running the reference solution fails because stdout trim is missing.',
        ]);
        $fbRes->assertStatus(201);
        $feedbackId = $fbRes->json('feedback.id');

        // Other educator cannot update feedback on challenge they don't own
        $this->actingAs($this->otherEducator)->patchJson("/api/educator/feedback/{$feedbackId}", [
            'status' => 'resolved',
        ])->assertStatus(403);

        // Owning educator triages & resolves feedback
        $this->actingAs($this->educator)->patchJson("/api/educator/feedback/{$feedbackId}", [
            'status' => 'resolved',
            'resolution_note' => 'Fixed test runner output trimming in v2.',
            'linked_challenge_version' => 2,
        ])->assertStatus(200)->assertJsonPath('feedback.status', 'resolved');

        // Educator creates classroom, enrolls learner, assigns challenge, views scoped progress
        $classRes = $this->actingAs($this->educator)->postJson('/api/educator/classrooms', [
            'name' => 'Spring Debugging Cohort',
            'description' => 'Weekly debugging labs',
        ]);
        $classRes->assertStatus(201);
        $classroomId = $classRes->json('classroom.id');

        $this->actingAs($this->educator)->postJson("/api/educator/classrooms/{$classroomId}/learners", [
            'email' => $this->learner->email,
        ])->assertStatus(200);

        $this->actingAs($this->educator)->postJson("/api/educator/classrooms/{$classroomId}/assignments", [
            'challenge_id' => $challenge->id,
            'note' => 'Solve before Friday',
        ])->assertStatus(201);

        // Other educator cannot view this classroom's progress
        $this->actingAs($this->otherEducator)->getJson("/api/educator/classrooms/{$classroomId}/progress")
            ->assertStatus(403);

        // Owning educator sees scoped progress without private source code
        $progressRes = $this->actingAs($this->educator)->getJson("/api/educator/classrooms/{$classroomId}/progress");
        $progressRes->assertStatus(200)
            ->assertJsonPath('learners.0.email', $this->learner->email)
            ->assertJsonMissingPath('learners.0.code');
    }

    public function test_phase_5_bulk_operations_analytics_audit_search_and_settings(): void
    {
        $c1 = Challenge::create([
            'author_id' => $this->educator->id,
            'slug' => 'bulk-1',
            'title' => 'Bulk Challenge 1',
            'difficulty' => 'beginner',
            'description' => 'Desc 1',
            'is_active' => false,
            'review_status' => Challenge::REVIEW_PENDING,
            'availability_status' => Challenge::AVAILABILITY_UNPUBLISHED,
        ]);

        // Bulk approve then bulk publish
        $this->actingAs($this->admin)->postJson('/api/admin/challenges/bulk', [
            'challenge_ids' => [$c1->id],
            'action' => 'approve',
        ])->assertStatus(200)->assertJsonPath('updated_count', 1);

        $this->actingAs($this->admin)->postJson('/api/admin/challenges/bulk', [
            'challenge_ids' => [$c1->id],
            'action' => 'publish',
        ])->assertStatus(200)->assertJsonPath('updated_count', 1);

        $this->assertTrue($c1->fresh()->is_active);

        // Platform settings read & update
        $this->actingAs($this->admin)->getJson('/api/admin/settings')->assertStatus(200);
        $this->actingAs($this->admin)->putJson('/api/admin/settings', [
            'settings' => [
                'require_validation_before_review' => true,
            ],
        ])->assertStatus(200)->assertJsonPath('changed_keys.0', 'require_validation_before_review');

        // Analytics & Audit Search
        $this->actingAs($this->admin)->getJson('/api/admin/analytics')
            ->assertStatus(200)
            ->assertJsonStructure(['daily_activity', 'difficulty_performance', 'top_reported_challenges']);

        $this->actingAs($this->admin)->getJson('/api/admin/audit-logs?action=setting')
            ->assertStatus(200)
            ->assertJsonPath('data.0.action', 'setting.updated');
    }
}
