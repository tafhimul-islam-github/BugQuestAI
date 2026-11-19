<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use App\Models\ChallengeFeedback;
use App\Models\ChallengeTestCase;
use App\Models\ChallengeVersion;
use App\Models\Classroom;
use App\Models\ClassroomAssignment;
use App\Models\PanelNotification;
use App\Models\SkillEvidence;
use App\Models\Submission;
use App\Models\User;
use App\Services\AuditService;
use App\Services\CodeJudgeService;
use App\Services\PlatformSettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EducatorPanelController extends Controller
{
    public function __construct(protected CodeJudgeService $judgeService)
    {
    }

    /**
     * Educator dashboard overview: owned challenges, pending reviews, open feedback, classroom summary.
     */
    public function overview(Request $request): JsonResponse
    {
        $user = $request->user();
        $challengeQuery = Challenge::query();
        if (!$user->isAdmin()) {
            $challengeQuery->where('author_id', $user->id);
        }

        $challenges = $challengeQuery->get(['id', 'review_status', 'availability_status', 'is_active']);
        $ownedIds = $challenges->pluck('id');

        $feedbackQuery = ChallengeFeedback::query();
        if (!$user->isAdmin()) {
            $feedbackQuery->where(function ($q) use ($ownedIds, $user) {
                $q->whereIn('challenge_id', $ownedIds)
                    ->orWhere('assigned_educator_id', $user->id);
            });
        }

        $openFeedback = (clone $feedbackQuery)->whereIn('status', ['open', 'in_progress'])->count();
        $resolvedFeedback = (clone $feedbackQuery)->where('status', 'resolved')->count();

        $classroomQuery = Classroom::query();
        if (!$user->isAdmin()) {
            $classroomQuery->where('educator_id', $user->id);
        }
        $classrooms = $classroomQuery->withCount(['learners', 'assignments'])->get();

        $recentNotifications = PanelNotification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(8)
            ->get();

        return response()->json([
            'summary' => [
                'total_challenges' => $challenges->count(),
                'drafts' => $challenges->where('review_status', Challenge::REVIEW_DRAFT)->count(),
                'pending_review' => $challenges->where('review_status', Challenge::REVIEW_PENDING)->count(),
                'changes_requested' => $challenges->where('review_status', Challenge::REVIEW_CHANGES_REQUESTED)->count(),
                'approved' => $challenges->where('review_status', Challenge::REVIEW_APPROVED)->count(),
                'published' => $challenges->where('availability_status', Challenge::AVAILABILITY_PUBLISHED)->count(),
                'open_feedback' => $openFeedback,
                'resolved_feedback' => $resolvedFeedback,
                'classrooms_count' => $classrooms->count(),
                'assigned_learners_count' => $classrooms->sum('learners_count'),
            ],
            'classrooms' => $classrooms,
            'notifications' => $recentNotifications,
        ]);
    }

    /**
     * List challenges owned by this educator (or all for admin).
     */
    public function listChallenges(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Challenge::with(['author:id,name,email', 'reviewer:id,name'])
            ->withCount([
                'testCases',
                'submissions',
                'feedback as open_feedback_count' => fn ($q) => $q->whereIn('status', ['open', 'in_progress']),
            ]);

        if (!$user->isAdmin()) {
            $query->where('author_id', $user->id);
        }

        if ($request->filled('review_status') && $request->review_status !== 'all') {
            $query->where('review_status', $request->review_status);
        }

        if ($request->filled('availability_status') && $request->availability_status !== 'all') {
            $query->where('availability_status', $request->availability_status);
        }

        if ($request->filled('search')) {
            $term = '%' . mb_strtolower(trim((string) $request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(title) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(category) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(framework) LIKE ?', [$term]);
            });
        }

        $challenges = $query->orderByDesc('updated_at')->get();

        return response()->json([
            'challenges' => $challenges,
        ]);
    }

    /**
     * Get full authoring detail for an owned challenge (including test cases & version history).
     */
    public function showChallenge(Request $request, int $id): JsonResponse
    {
        $challenge = $this->findAuthorizedChallenge($request->user(), $id);
        $challenge->load(['testCases', 'versions.editor:id,name', 'reviewer:id,name', 'author:id,name']);

        return response()->json([
            'challenge' => $challenge,
        ]);
    }

    /**
     * Create a new challenge as a Draft (educators cannot self-publish).
     */
    public function createChallenge(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'category' => 'nullable|string|max:100',
            'framework' => 'nullable|string|max:100',
            'investigation_time_minutes' => 'nullable|integer|min:5|max:180',
            'description' => 'required|string',
            'bug_report' => 'nullable|array',
            'repository_files' => 'nullable|array',
            'reference_patch' => 'nullable|array',
            'entrypoint_test' => 'nullable|string|max:255',
            'input_spec' => 'nullable|string',
            'output_spec' => 'nullable|string',
            'constraints' => 'nullable|array',
            'starter_code' => 'nullable|array',
            'supported_languages' => 'nullable|array',
            'topics' => 'nullable|array',
            'hints' => 'nullable|array',
            'editorial' => 'nullable|string',
            'test_cases' => 'nullable|array',
            'submit_for_review' => 'nullable|boolean',
        ]);

        $slug = Str::slug($validated['title']) . '-' . Str::lower(Str::random(5));
        $initialReviewStatus = !empty($validated['submit_for_review'])
            ? Challenge::REVIEW_PENDING
            : Challenge::REVIEW_DRAFT;

        $challenge = Challenge::create([
            'author_id' => $user->id,
            'slug' => $slug,
            'title' => $validated['title'],
            'difficulty' => $validated['difficulty'],
            'category' => $validated['category'] ?? 'logic_state',
            'framework' => $validated['framework'] ?? 'Node.js',
            'investigation_time_minutes' => $validated['investigation_time_minutes'] ?? 25,
            'description' => $validated['description'],
            'bug_report' => $validated['bug_report'] ?? null,
            'repository_files' => $validated['repository_files'] ?? null,
            'reference_patch' => $validated['reference_patch'] ?? null,
            'entrypoint_test' => $validated['entrypoint_test'] ?? null,
            'input_spec' => $validated['input_spec'] ?? null,
            'output_spec' => $validated['output_spec'] ?? null,
            'constraints' => $validated['constraints'] ?? [],
            'starter_code' => $validated['starter_code'] ?? [],
            'supported_languages' => $validated['supported_languages'] ?? ['javascript', 'python'],
            'topics' => $validated['topics'] ?? [],
            'hints' => $validated['hints'] ?? [],
            'editorial' => $validated['editorial'] ?? null,
            'time_limit_ms' => 2000,
            'memory_limit_mb' => 128,
            'is_active' => false,
            'review_status' => $initialReviewStatus,
            'availability_status' => Challenge::AVAILABILITY_UNPUBLISHED,
            'version' => 1,
        ]);

        if (!empty($validated['test_cases'])) {
            foreach ($validated['test_cases'] as $index => $tc) {
                ChallengeTestCase::create([
                    'challenge_id' => $challenge->id,
                    'input' => $tc['input'] ?? '',
                    'expected_output' => $tc['expected_output'] ?? '',
                    'is_hidden' => (bool) ($tc['is_hidden'] ?? false),
                    'explanation' => $tc['explanation'] ?? null,
                    'order_index' => $index,
                ]);
            }
        }

        AuditService::record(
            $user,
            'challenge.created',
            "Created draft challenge \"{$challenge->title}\"",
            'challenge',
            $challenge->id,
            ['review_status' => $challenge->review_status],
            $request
        );

        if ($initialReviewStatus === Challenge::REVIEW_PENDING) {
            $this->notifyAdminsOfSubmission($challenge, $user);
        }

        return response()->json([
            'message' => $initialReviewStatus === Challenge::REVIEW_PENDING
                ? 'Challenge created and submitted for admin review.'
                : 'Challenge draft saved.',
            'challenge' => $challenge->load('testCases'),
        ], 201);
    }

    /**
     * Update an owned challenge. Editing a published/approved challenge creates a version snapshot
     * and triggers re-review.
     */
    public function updateChallenge(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $challenge = $this->findAuthorizedChallenge($user, $id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'difficulty' => 'sometimes|required|in:beginner,intermediate,advanced',
            'category' => 'nullable|string|max:100',
            'framework' => 'nullable|string|max:100',
            'investigation_time_minutes' => 'nullable|integer|min:5|max:180',
            'description' => 'sometimes|required|string',
            'bug_report' => 'nullable|array',
            'repository_files' => 'nullable|array',
            'reference_patch' => 'nullable|array',
            'entrypoint_test' => 'nullable|string|max:255',
            'input_spec' => 'nullable|string',
            'output_spec' => 'nullable|string',
            'constraints' => 'nullable|array',
            'starter_code' => 'nullable|array',
            'supported_languages' => 'nullable|array',
            'topics' => 'nullable|array',
            'hints' => 'nullable|array',
            'editorial' => 'nullable|string',
            'test_cases' => 'nullable|array',
            'change_summary' => 'nullable|string|max:500',
        ]);

        $wasApprovedOrPublished = $challenge->review_status === Challenge::REVIEW_APPROVED
            || $challenge->availability_status === Challenge::AVAILABILITY_PUBLISHED;

        if ($wasApprovedOrPublished) {
            ChallengeVersion::create([
                'challenge_id' => $challenge->id,
                'version_number' => $challenge->version,
                'editor_id' => $user->id,
                'change_summary' => $validated['change_summary'] ?? 'Content maintenance edit',
                'snapshot' => $challenge->snapshotPayload(),
                'created_at' => now(),
            ]);
        }

        $updatable = collect($validated)->except(['test_cases', 'change_summary'])->toArray();

        if ($wasApprovedOrPublished) {
            $updatable['version'] = ($challenge->version ?? 1) + 1;
            $updatable['review_status'] = Challenge::REVIEW_PENDING;
        }

        $challenge->update($updatable);

        if (array_key_exists('test_cases', $validated) && is_array($validated['test_cases'])) {
            $challenge->testCases()->delete();
            foreach ($validated['test_cases'] as $index => $tc) {
                ChallengeTestCase::create([
                    'challenge_id' => $challenge->id,
                    'input' => $tc['input'] ?? '',
                    'expected_output' => $tc['expected_output'] ?? '',
                    'is_hidden' => (bool) ($tc['is_hidden'] ?? false),
                    'explanation' => $tc['explanation'] ?? null,
                    'order_index' => $index,
                ]);
            }
        }

        AuditService::record(
            $user,
            'challenge.updated',
            "Updated challenge \"{$challenge->title}\" (v{$challenge->version})",
            'challenge',
            $challenge->id,
            [
                'version' => $challenge->version,
                're_review_triggered' => $wasApprovedOrPublished,
                'change_summary' => $validated['change_summary'] ?? null,
            ],
            $request
        );

        if ($wasApprovedOrPublished) {
            $this->notifyAdminsOfSubmission($challenge, $user);
        }

        return response()->json([
            'message' => $wasApprovedOrPublished
                ? "Version v{$challenge->version} saved and queued for admin re-review."
                : 'Challenge draft updated.',
            'challenge' => $challenge->fresh(['testCases', 'versions.editor:id,name']),
        ]);
    }

    /**
     * Run automated validation on an owned challenge.
     */
    public function validateChallenge(Request $request, int $id): JsonResponse
    {
        $challenge = $this->findAuthorizedChallenge($request->user(), $id);

        if (empty($challenge->repository_files) || empty($challenge->reference_patch)) {
            $hasTests = $challenge->testCases()->exists();
            $hasStarter = !empty($challenge->starter_code);
            $basicValid = $hasTests && $hasStarter;

            $challenge->forceFill([
                'last_validated_at' => now(),
                'last_validation_passed' => $basicValid,
            ])->save();

            return response()->json([
                'valid' => $basicValid,
                'mode' => 'structural',
                'defect_reproduced' => $hasStarter,
                'reference_fix_passes' => $hasTests,
                'summary' => $basicValid
                    ? 'Structural validation passed: starter code and regression test cases are configured.'
                    : 'Validation failed: add starter code and at least one test case (or multi-file repository_files + reference_patch).',
            ]);
        }

        $lang = $challenge->supported_languages[0] ?? 'javascript';
        $unmodifiedEval = $this->judgeService->evaluate($challenge, $lang, '', []);
        $patchedEval = $this->judgeService->evaluate($challenge, $lang, '', $challenge->reference_patch);

        $defectReproduced = ($unmodifiedEval['status'] !== 'accepted');
        $referenceFixPasses = ($patchedEval['status'] === 'accepted');
        $isValid = $defectReproduced && $referenceFixPasses;

        $challenge->forceFill([
            'last_validated_at' => now(),
            'last_validation_passed' => $isValid,
        ])->save();

        return response()->json([
            'valid' => $isValid,
            'mode' => 'mutation',
            'defect_reproduced' => $defectReproduced,
            'unmodified_status' => $unmodifiedEval['status'],
            'unmodified_error' => $unmodifiedEval['error_output'],
            'reference_fix_passes' => $referenceFixPasses,
            'patched_status' => $patchedEval['status'],
            'patched_pass_count' => $patchedEval['pass_count'],
            'patched_total_count' => $patchedEval['total_count'],
            'summary' => $isValid
                ? 'Challenge validated: defect reproduces in starter code and reference patch passes 100% of tests.'
                : 'Validation failed: ensure unmodified starter fails tests and reference patch passes all tests.',
        ]);
    }

    /**
     * Submit a draft or changes-requested challenge for admin review.
     */
    public function submitForReview(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $challenge = $this->findAuthorizedChallenge($user, $id);

        if (!in_array($challenge->review_status, [Challenge::REVIEW_DRAFT, Challenge::REVIEW_CHANGES_REQUESTED], true)) {
            return response()->json([
                'message' => "Cannot submit challenge in '{$challenge->review_status}' review state.",
            ], 422);
        }

        $requireValidation = (bool) PlatformSettingService::getValue('require_validation_before_review', false);
        if ($requireValidation && !$challenge->last_validation_passed) {
            return response()->json([
                'message' => 'Platform policy requires passing challenge validation before submitting for review.',
            ], 422);
        }

        $challenge->update([
            'review_status' => Challenge::REVIEW_PENDING,
        ]);

        AuditService::record(
            $user,
            'challenge.submitted_for_review',
            "Submitted challenge \"{$challenge->title}\" for admin review",
            'challenge',
            $challenge->id,
            ['version' => $challenge->version],
            $request
        );

        $this->notifyAdminsOfSubmission($challenge, $user);

        return response()->json([
            'message' => 'Challenge submitted for admin review.',
            'challenge' => $challenge->fresh(),
        ]);
    }

    /**
     * Educator Feedback Inbox: list learner reports for owned/assigned challenges.
     */
    public function listFeedback(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = ChallengeFeedback::with([
            'challenge:id,title,slug,version,author_id',
            'reporter:id,name',
            'resolver:id,name',
        ]);

        if (!$user->isAdmin()) {
            $ownedIds = Challenge::where('author_id', $user->id)->pluck('id');
            $query->where(function ($q) use ($ownedIds, $user) {
                $q->whereIn('challenge_id', $ownedIds)
                    ->orWhere('assigned_educator_id', $user->id);
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('severity') && $request->severity !== 'all') {
            $query->where('severity', $request->severity);
        }

        return response()->json([
            'feedback' => $query->orderByDesc('created_at')->get(),
        ]);
    }

    /**
     * Triage / resolve a learner feedback report for an owned challenge.
     */
    public function updateFeedback(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $feedback = ChallengeFeedback::with('challenge')->findOrFail($id);

        if (!$user->isAdmin()) {
            $isOwner = $feedback->challenge && $feedback->challenge->author_id === $user->id;
            $isAssigned = $feedback->assigned_educator_id === $user->id;
            if (!$isOwner && !$isAssigned) {
                return response()->json(['message' => 'Forbidden. You can only manage feedback for your own challenges.'], 403);
            }
        }

        $validated = $request->validate([
            'status' => 'required|in:open,in_progress,resolved,dismissed',
            'resolution_note' => 'nullable|string|max:2000',
            'linked_challenge_version' => 'nullable|integer|min:1',
        ]);

        $isResolved = in_array($validated['status'], ['resolved', 'dismissed'], true);

        $feedback->update([
            'status' => $validated['status'],
            'resolution_note' => $validated['resolution_note'] ?? $feedback->resolution_note,
            'linked_challenge_version' => $validated['linked_challenge_version'] ?? $feedback->linked_challenge_version,
            'resolved_by' => $isResolved ? $user->id : null,
            'resolved_at' => $isResolved ? now() : null,
        ]);

        AuditService::record(
            $user,
            'feedback.updated',
            "Marked feedback #{$feedback->id} as {$validated['status']}",
            'challenge_feedback',
            $feedback->id,
            ['challenge_id' => $feedback->challenge_id, 'status' => $validated['status']],
            $request
        );

        if ($feedback->reporter_id !== $user->id) {
            AuditService::notify(
                $feedback->reporter_id,
                'feedback_updated',
                'Update on your report: ' . $feedback->title,
                'Status changed to ' . str_replace('_', ' ', $validated['status']) . ($feedback->resolution_note ? ' — ' . $feedback->resolution_note : ''),
                '/challenges'
            );
        }

        return response()->json([
            'message' => 'Feedback report updated.',
            'feedback' => $feedback->fresh(['challenge:id,title,slug,version', 'reporter:id,name', 'resolver:id,name']),
        ]);
    }

    // -------------------------------------------------------------------------
    // Phase 4: Educator Classrooms, Learner Assignments & Scoped Progress
    // -------------------------------------------------------------------------

    public function listClassrooms(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Classroom::with(['assignments.challenge:id,title,slug,difficulty,availability_status'])
            ->withCount(['learners', 'assignments']);

        if (!$user->isAdmin()) {
            $query->where('educator_id', $user->id);
        }

        return response()->json([
            'classrooms' => $query->orderByDesc('created_at')->get(),
        ]);
    }

    public function createClassroom(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'description' => 'nullable|string|max:1000',
        ]);

        $code = 'BQ-' . Str::upper(Str::random(6));

        $classroom = Classroom::create([
            'educator_id' => $user->id,
            'name' => $validated['name'],
            'code' => $code,
            'description' => $validated['description'] ?? null,
            'is_active' => true,
        ]);

        AuditService::record(
            $user,
            'classroom.created',
            "Created classroom \"{$classroom->name}\" ({$classroom->code})",
            'classroom',
            $classroom->id,
            [],
            $request
        );

        return response()->json([
            'message' => 'Classroom created.',
            'classroom' => $classroom->loadCount(['learners', 'assignments']),
        ], 201);
    }

    public function addLearnerToClassroom(Request $request, int $classroomId): JsonResponse
    {
        $classroom = $this->findAuthorizedClassroom($request->user(), $classroomId);

        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $learner = User::where('email', $validated['email'])->firstOrFail();
        if (!$learner->isLearner()) {
            return response()->json(['message' => 'Only learner accounts can be enrolled into a classroom.'], 422);
        }

        $classroom->learners()->syncWithoutDetaching([
            $learner->id => ['enrolled_at' => now()],
        ]);

        AuditService::notify(
            $learner->id,
            'classroom_enrolled',
            "Enrolled in {$classroom->name}",
            "{$request->user()->name} added you to classroom {$classroom->name}.",
            '/dashboard'
        );

        return response()->json([
            'message' => "{$learner->name} enrolled in {$classroom->name}.",
            'learner' => [
                'id' => $learner->id,
                'name' => $learner->name,
                'email' => $learner->email,
                'target_role' => $learner->target_role,
            ],
        ]);
    }

    public function removeLearnerFromClassroom(Request $request, int $classroomId, int $learnerId): JsonResponse
    {
        $classroom = $this->findAuthorizedClassroom($request->user(), $classroomId);
        $classroom->learners()->detach($learnerId);

        return response()->json(['message' => 'Learner removed from classroom.']);
    }

    public function assignChallengeToClassroom(Request $request, int $classroomId): JsonResponse
    {
        $user = $request->user();
        $classroom = $this->findAuthorizedClassroom($user, $classroomId);

        $validated = $request->validate([
            'challenge_id' => 'required|integer|exists:challenges,id',
            'due_at' => 'nullable|date',
            'note' => 'nullable|string|max:1000',
        ]);

        $challenge = Challenge::findOrFail($validated['challenge_id']);
        if ($challenge->availability_status !== Challenge::AVAILABILITY_PUBLISHED) {
            return response()->json(['message' => 'Only published challenges can be assigned to learners.'], 422);
        }

        $assignment = ClassroomAssignment::updateOrCreate(
            [
                'classroom_id' => $classroom->id,
                'challenge_id' => $challenge->id,
            ],
            [
                'assigned_by' => $user->id,
                'due_at' => $validated['due_at'] ?? null,
                'note' => $validated['note'] ?? null,
            ]
        );

        foreach ($classroom->learners()->pluck('users.id') as $learnerId) {
            AuditService::notify(
                $learnerId,
                'assignment_created',
                "New practice assigned: {$challenge->title}",
                "Assigned in {$classroom->name}" . ($assignment->note ? " — {$assignment->note}" : ''),
                "/challenge/{$challenge->slug}"
            );
        }

        return response()->json([
            'message' => 'Challenge assigned to classroom.',
            'assignment' => $assignment->load('challenge:id,title,slug,difficulty'),
        ], 201);
    }

    public function removeAssignment(Request $request, int $classroomId, int $assignmentId): JsonResponse
    {
        $classroom = $this->findAuthorizedClassroom($request->user(), $classroomId);
        $classroom->assignments()->where('id', $assignmentId)->delete();

        return response()->json(['message' => 'Assignment removed.']);
    }

    /**
     * Scoped classroom progress view: aggregate metrics & assignment completion ONLY.
     * Private learner code, patch diffs, and AI coaching transcripts are never exposed.
     */
    public function classroomProgress(Request $request, int $classroomId): JsonResponse
    {
        $classroom = $this->findAuthorizedClassroom($request->user(), $classroomId);
        $classroom->load([
            'learners:id,name,email,target_role,status',
            'assignments.challenge:id,title,slug,difficulty',
        ]);

        $assignedChallengeIds = $classroom->assignments->pluck('challenge_id')->all();
        $learnerIds = $classroom->learners->pluck('id')->all();

        $submissions = Submission::whereIn('user_id', $learnerIds)
            ->get(['user_id', 'challenge_id', 'status', 'pass_count', 'total_count', 'created_at']);

        $skills = SkillEvidence::whereIn('user_id', $learnerIds)
            ->get(['user_id', 'topic', 'score', 'proficiency_level']);

        $learnerSummaries = $classroom->learners->map(function (User $learner) use ($submissions, $skills, $assignedChallengeIds) {
            $userSubs = $submissions->where('user_id', $learner->id);
            $solvedIds = $userSubs->where('status', 'accepted')->pluck('challenge_id')->unique()->values()->all();
            $assignedCompleted = count(array_intersect($assignedChallengeIds, $solvedIds));
            $totalAssigned = count($assignedChallengeIds);
            $userSkills = $skills->where('user_id', $learner->id);

            return [
                'id' => $learner->id,
                'name' => $learner->name,
                'email' => $learner->email,
                'target_role' => $learner->target_role,
                'status' => $learner->status,
                'total_submissions' => $userSubs->count(),
                'challenges_solved' => count($solvedIds),
                'assigned_completed' => $assignedCompleted,
                'assigned_total' => $totalAssigned,
                'completion_rate' => $totalAssigned > 0 ? round(($assignedCompleted / $totalAssigned) * 100) : 0,
                'avg_skill_score' => $userSkills->count() > 0 ? round($userSkills->avg('score')) : 0,
                'last_activity_at' => $userSubs->max('created_at')?->toIso8601String(),
            ];
        })->values();

        return response()->json([
            'classroom' => [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'code' => $classroom->code,
                'description' => $classroom->description,
            ],
            'assignments' => $classroom->assignments,
            'learners' => $learnerSummaries,
            'privacy_notice' => 'Scoped summary only: individual source code and AI coaching conversations remain private.',
        ]);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    protected function findAuthorizedChallenge(User $user, int $id): Challenge
    {
        $challenge = Challenge::findOrFail($id);
        if (!$user->isAdmin() && $challenge->author_id !== $user->id) {
            abort(403, 'Forbidden. You can only manage challenges you authored.');
        }

        return $challenge;
    }

    protected function findAuthorizedClassroom(User $user, int $id): Classroom
    {
        $classroom = Classroom::findOrFail($id);
        if (!$user->isAdmin() && $classroom->educator_id !== $user->id) {
            abort(403, 'Forbidden. You can only manage your own classrooms.');
        }

        return $classroom;
    }

    protected function notifyAdminsOfSubmission(Challenge $challenge, User $author): void
    {
        $adminIds = User::where('role', 'admin')->where('id', '!=', $author->id)->pluck('id');
        foreach ($adminIds as $adminId) {
            AuditService::notify(
                $adminId,
                'review_submitted',
                "Challenge awaiting review: {$challenge->title}",
                "{$author->name} submitted v{$challenge->version} for moderation review.",
                '/admin/moderation'
            );
        }
    }
}
