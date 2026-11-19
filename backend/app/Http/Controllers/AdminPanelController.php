<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Challenge;
use App\Models\ChallengeFeedback;
use App\Models\Submission;
use App\Models\User;
use App\Services\AuditService;
use App\Services\PlatformSettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class AdminPanelController extends Controller
{
    /**
     * Admin Overview Dashboard: platform counts, pending moderation, unresolved reports, operational health.
     */
    public function overview(): JsonResponse
    {
        $usersByRole = User::select('role', DB::raw('count(*) as total'))
            ->groupBy('role')
            ->pluck('total', 'role');

        $suspendedUsers = User::where('status', 'suspended')->count();

        $challengesByReview = Challenge::select('review_status', DB::raw('count(*) as total'))
            ->groupBy('review_status')
            ->pluck('total', 'review_status');

        $challengesByAvailability = Challenge::select('availability_status', DB::raw('count(*) as total'))
            ->groupBy('availability_status')
            ->pluck('total', 'availability_status');

        $unresolvedFeedback = ChallengeFeedback::whereIn('status', ['open', 'in_progress'])->count();
        $highSeverityFeedback = ChallengeFeedback::whereIn('status', ['open', 'in_progress'])
            ->where('severity', 'high')
            ->count();

        $totalSubmissions = Submission::count();
        $acceptedSubmissions = Submission::where('status', 'accepted')->count();

        // Operational health check (safe, zero secrets)
        $dbHealth = 'operational';
        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            $dbHealth = 'degraded';
        }

        $aiHealth = 'fallback_active';
        try {
            $res = Http::timeout(2)->get(env('AI_SERVICE_URL', 'http://127.0.0.1:8001') . '/health');
            if ($res->successful()) {
                $aiHealth = 'operational';
            }
        } catch (\Throwable $e) {
            $aiHealth = 'fallback_active';
        }

        $recentAudit = AuditLog::with('actor:id,name,role')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json([
            'metrics' => [
                'learners_count' => (int) ($usersByRole['learner'] ?? 0),
                'educators_count' => (int) ($usersByRole['educator'] ?? 0),
                'admins_count' => (int) ($usersByRole['admin'] ?? 0),
                'suspended_users_count' => $suspendedUsers,
                'active_challenges_count' => (int) ($challengesByAvailability[Challenge::AVAILABILITY_PUBLISHED] ?? 0),
                'pending_reviews_count' => (int) ($challengesByReview[Challenge::REVIEW_PENDING] ?? 0),
                'changes_requested_count' => (int) ($challengesByReview[Challenge::REVIEW_CHANGES_REQUESTED] ?? 0),
                'draft_challenges_count' => (int) ($challengesByReview[Challenge::REVIEW_DRAFT] ?? 0),
                'disabled_challenges_count' => (int) ($challengesByAvailability[Challenge::AVAILABILITY_DISABLED] ?? 0),
                'archived_challenges_count' => (int) ($challengesByAvailability[Challenge::AVAILABILITY_ARCHIVED] ?? 0),
                'unresolved_reports_count' => $unresolvedFeedback,
                'high_severity_reports_count' => $highSeverityFeedback,
                'total_submissions' => $totalSubmissions,
                'acceptance_rate' => $totalSubmissions > 0 ? round(($acceptedSubmissions / $totalSubmissions) * 100, 1) : 0,
            ],
            'operational_status' => [
                'database' => $dbHealth,
                'code_judge' => 'operational',
                'ai_service' => $aiHealth,
                'checked_at' => now()->toIso8601String(),
            ],
            'recent_audit' => $recentAudit,
        ]);
    }

    // -------------------------------------------------------------------------
    // User Management
    // -------------------------------------------------------------------------

    public function listUsers(Request $request): JsonResponse
    {
        $query = User::withCount(['submissions', 'authoredChallenges']);

        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $term = '%' . mb_strtolower(trim((string) $request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(name) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(email) LIKE ?', [$term]);
            });
        }

        $users = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($users);
    }

    public function updateUserRole(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $target = User::findOrFail($id);

        $validated = $request->validate([
            'role' => 'required|in:learner,educator,admin',
        ]);

        if ($target->id === $admin->id && $validated['role'] !== 'admin') {
            return response()->json(['message' => 'You cannot remove your own admin role.'], 422);
        }

        $oldRole = $target->role;
        $target->update(['role' => $validated['role']]);

        AuditService::record(
            $admin,
            'user.role_updated',
            "Changed role for {$target->email} from {$oldRole} to {$validated['role']}",
            'user',
            $target->id,
            ['from' => $oldRole, 'to' => $validated['role']],
            $request
        );

        return response()->json([
            'message' => 'User role updated.',
            'user' => $target->fresh(),
        ]);
    }

    public function updateUserStatus(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $target = User::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:active,suspended',
            'reason' => 'nullable|string|max:500',
        ]);

        if ($target->id === $admin->id && $validated['status'] === 'suspended') {
            return response()->json(['message' => 'You cannot suspend your own account.'], 422);
        }

        if ($validated['status'] === 'suspended') {
            $target->update([
                'status' => 'suspended',
                'suspended_at' => now(),
                'suspended_reason' => $validated['reason'] ?? 'Suspended by platform administrator.',
            ]);
            // Immediately revoke active tokens
            $target->tokens()->delete();
        } else {
            $target->update([
                'status' => 'active',
                'suspended_at' => null,
                'suspended_reason' => null,
            ]);
        }

        AuditService::record(
            $admin,
            $validated['status'] === 'suspended' ? 'user.suspended' : 'user.reactivated',
            ($validated['status'] === 'suspended' ? 'Suspended' : 'Reactivated') . " account {$target->email}",
            'user',
            $target->id,
            ['reason' => $validated['reason'] ?? null],
            $request
        );

        return response()->json([
            'message' => $validated['status'] === 'suspended' ? 'Account suspended.' : 'Account reactivated.',
            'user' => $target->fresh(),
        ]);
    }

    /**
     * Review account history. Access to learner records is explicitly audit-logged.
     */
    public function userHistory(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $target = User::withCount(['submissions', 'authoredChallenges', 'readinessReports'])->findOrFail($id);

        $reason = trim((string) $request->input('reason', 'Administrative account review'));

        if ($target->isLearner()) {
            AuditService::record(
                $admin,
                'learner.record_accessed',
                "Viewed account history for learner {$target->email}",
                'user',
                $target->id,
                ['reason' => $reason],
                $request
            );
        }

        $auditEvents = AuditLog::with('actor:id,name,role')
            ->where(function ($q) use ($target) {
                $q->where('actor_id', $target->id)
                    ->orWhere(function ($sub) use ($target) {
                        $sub->where('target_type', 'user')->where('target_id', $target->id);
                    });
            })
            ->orderByDesc('created_at')
            ->limit(25)
            ->get();

        // Aggregate submission metadata only (no private source code)
        $recentSubmissions = Submission::with('challenge:id,title,slug')
            ->where('user_id', $target->id)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get(['id', 'challenge_id', 'status', 'language', 'pass_count', 'total_count', 'created_at']);

        return response()->json([
            'user' => $target,
            'audit_events' => $auditEvents,
            'recent_submissions' => $recentSubmissions,
        ]);
    }

    // -------------------------------------------------------------------------
    // Challenge Moderation & Lifecycle
    // -------------------------------------------------------------------------

    public function listChallenges(Request $request): JsonResponse
    {
        $query = Challenge::with(['author:id,name,email', 'reviewer:id,name'])
            ->withCount([
                'testCases',
                'submissions',
                'feedback as open_feedback_count' => fn ($q) => $q->whereIn('status', ['open', 'in_progress']),
            ]);

        if ($request->filled('review_status') && $request->review_status !== 'all') {
            $query->where('review_status', $request->review_status);
        }

        if ($request->filled('availability_status') && $request->availability_status !== 'all') {
            $query->where('availability_status', $request->availability_status);
        }

        if ($request->filled('difficulty') && $request->difficulty !== 'all') {
            $query->where('difficulty', $request->difficulty);
        }

        if ($request->filled('search')) {
            $term = '%' . mb_strtolower(trim((string) $request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(title) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(category) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(framework) LIKE ?', [$term]);
            });
        }

        return response()->json([
            'challenges' => $query->orderByDesc('updated_at')->get(),
        ]);
    }

    public function approveChallenge(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $challenge = Challenge::findOrFail($id);

        $validated = $request->validate([
            'review_notes' => 'nullable|string|max:2000',
        ]);

        $challenge->update([
            'review_status' => Challenge::REVIEW_APPROVED,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
            'review_notes' => $validated['review_notes'] ?? 'Approved by platform moderator.',
        ]);

        AuditService::record(
            $admin,
            'challenge.approved',
            "Approved challenge \"{$challenge->title}\" (v{$challenge->version})",
            'challenge',
            $challenge->id,
            ['review_notes' => $challenge->review_notes],
            $request
        );

        if ($challenge->author_id && $challenge->author_id !== $admin->id) {
            AuditService::notify(
                $challenge->author_id,
                'review_decision',
                "Approved: {$challenge->title}",
                'Your challenge passed review and is ready to be published.',
                '/educator/challenges'
            );
        }

        return response()->json([
            'message' => 'Challenge approved. You can now publish it to make it visible to learners.',
            'challenge' => $challenge->fresh(['author:id,name', 'reviewer:id,name']),
        ]);
    }

    public function requestChanges(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $challenge = Challenge::findOrFail($id);

        $validated = $request->validate([
            'review_notes' => 'required|string|min:5|max:2000',
        ]);

        $challenge->update([
            'review_status' => Challenge::REVIEW_CHANGES_REQUESTED,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
            'review_notes' => $validated['review_notes'],
        ]);

        AuditService::record(
            $admin,
            'challenge.changes_requested',
            "Requested changes on challenge \"{$challenge->title}\"",
            'challenge',
            $challenge->id,
            ['review_notes' => $validated['review_notes']],
            $request
        );

        if ($challenge->author_id && $challenge->author_id !== $admin->id) {
            AuditService::notify(
                $challenge->author_id,
                'review_decision',
                "Changes requested: {$challenge->title}",
                $validated['review_notes'],
                '/educator/challenges'
            );
        }

        return response()->json([
            'message' => 'Changes requested and author notified.',
            'challenge' => $challenge->fresh(['author:id,name', 'reviewer:id,name']),
        ]);
    }

    public function publishChallenge(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $challenge = Challenge::findOrFail($id);

        if ($challenge->review_status !== Challenge::REVIEW_APPROVED) {
            return response()->json([
                'message' => 'Only approved challenges can be published. Approve this challenge first.',
            ], 422);
        }

        $challenge->update([
            'availability_status' => Challenge::AVAILABILITY_PUBLISHED,
            'is_active' => true,
            'published_at' => $challenge->published_at ?? now(),
        ]);

        AuditService::record(
            $admin,
            'challenge.published',
            "Published challenge \"{$challenge->title}\"",
            'challenge',
            $challenge->id,
            ['version' => $challenge->version],
            $request
        );

        if ($challenge->author_id && $challenge->author_id !== $admin->id) {
            AuditService::notify(
                $challenge->author_id,
                'review_decision',
                "Published: {$challenge->title}",
                'Your challenge is now live for learners.',
                "/challenge/{$challenge->slug}"
            );
        }

        return response()->json([
            'message' => 'Challenge published to learners.',
            'challenge' => $challenge->fresh(['author:id,name', 'reviewer:id,name']),
        ]);
    }

    public function disableChallenge(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $challenge = Challenge::findOrFail($id);

        $challenge->update([
            'availability_status' => Challenge::AVAILABILITY_DISABLED,
            'is_active' => false,
        ]);

        AuditService::record(
            $admin,
            'challenge.disabled',
            "Disabled challenge \"{$challenge->title}\" (existing submissions preserved)",
            'challenge',
            $challenge->id,
            ['reason' => $request->input('reason')],
            $request
        );

        return response()->json([
            'message' => 'Challenge disabled. Existing learner submissions are preserved.',
            'challenge' => $challenge->fresh(),
        ]);
    }

    public function archiveChallenge(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $challenge = Challenge::findOrFail($id);

        $challenge->update([
            'availability_status' => Challenge::AVAILABILITY_ARCHIVED,
            'is_active' => false,
        ]);

        AuditService::record(
            $admin,
            'challenge.archived',
            "Archived challenge \"{$challenge->title}\"",
            'challenge',
            $challenge->id,
            [],
            $request
        );

        return response()->json([
            'message' => 'Challenge archived.',
            'challenge' => $challenge->fresh(),
        ]);
    }

    public function restoreChallenge(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $challenge = Challenge::findOrFail($id);

        $publishImmediately = (bool) $request->input('publish', false)
            && $challenge->review_status === Challenge::REVIEW_APPROVED;

        $challenge->update([
            'availability_status' => $publishImmediately
                ? Challenge::AVAILABILITY_PUBLISHED
                : Challenge::AVAILABILITY_UNPUBLISHED,
            'is_active' => $publishImmediately,
        ]);

        AuditService::record(
            $admin,
            'challenge.restored',
            "Restored challenge \"{$challenge->title}\" to {$challenge->availability_status}",
            'challenge',
            $challenge->id,
            ['availability_status' => $challenge->availability_status],
            $request
        );

        return response()->json([
            'message' => $publishImmediately ? 'Challenge restored and published.' : 'Challenge restored to unpublished state.',
            'challenge' => $challenge->fresh(),
        ]);
    }

    /**
     * Phase 5: Bulk challenge moderation operations.
     */
    public function bulkChallenges(Request $request): JsonResponse
    {
        $admin = $request->user();

        $validated = $request->validate([
            'challenge_ids' => 'required|array|min:1',
            'challenge_ids.*' => 'integer|exists:challenges,id',
            'action' => 'required|in:approve,publish,disable,archive,restore',
        ]);

        $challenges = Challenge::whereIn('id', $validated['challenge_ids'])->get();
        $updatedCount = 0;
        $skippedIds = [];

        foreach ($challenges as $challenge) {
            switch ($validated['action']) {
                case 'approve':
                    $challenge->update([
                        'review_status' => Challenge::REVIEW_APPROVED,
                        'reviewed_by' => $admin->id,
                        'reviewed_at' => now(),
                    ]);
                    $updatedCount++;
                    break;

                case 'publish':
                    if ($challenge->review_status !== Challenge::REVIEW_APPROVED) {
                        $skippedIds[] = $challenge->id;
                        continue 2;
                    }
                    $challenge->update([
                        'availability_status' => Challenge::AVAILABILITY_PUBLISHED,
                        'is_active' => true,
                        'published_at' => $challenge->published_at ?? now(),
                    ]);
                    $updatedCount++;
                    break;

                case 'disable':
                    $challenge->update([
                        'availability_status' => Challenge::AVAILABILITY_DISABLED,
                        'is_active' => false,
                    ]);
                    $updatedCount++;
                    break;

                case 'archive':
                    $challenge->update([
                        'availability_status' => Challenge::AVAILABILITY_ARCHIVED,
                        'is_active' => false,
                    ]);
                    $updatedCount++;
                    break;

                case 'restore':
                    $challenge->update([
                        'availability_status' => Challenge::AVAILABILITY_UNPUBLISHED,
                        'is_active' => false,
                    ]);
                    $updatedCount++;
                    break;
            }
        }

        AuditService::record(
            $admin,
            'challenge.bulk_' . $validated['action'],
            "Bulk {$validated['action']} applied to {$updatedCount} challenge(s)",
            'challenge',
            null,
            [
                'requested_ids' => $validated['challenge_ids'],
                'updated_count' => $updatedCount,
                'skipped_ids' => $skippedIds,
            ],
            $request
        );

        return response()->json([
            'message' => "Bulk {$validated['action']} completed for {$updatedCount} challenge(s).",
            'updated_count' => $updatedCount,
            'skipped_ids' => $skippedIds,
        ]);
    }

    // -------------------------------------------------------------------------
    // Admin Feedback Moderation
    // -------------------------------------------------------------------------

    public function listFeedback(Request $request): JsonResponse
    {
        $query = ChallengeFeedback::with([
            'challenge:id,title,slug,version',
            'reporter:id,name',
            'resolver:id,name',
        ]);

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

    public function updateFeedback(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $feedback = ChallengeFeedback::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:open,in_progress,resolved,dismissed',
            'resolution_note' => 'nullable|string|max:2000',
        ]);

        $isResolved = in_array($validated['status'], ['resolved', 'dismissed'], true);
        $feedback->update([
            'status' => $validated['status'],
            'resolution_note' => $validated['resolution_note'] ?? $feedback->resolution_note,
            'resolved_by' => $isResolved ? $admin->id : null,
            'resolved_at' => $isResolved ? now() : null,
        ]);

        AuditService::record(
            $admin,
            'feedback.moderated',
            "Admin updated feedback #{$feedback->id} to {$validated['status']}",
            'challenge_feedback',
            $feedback->id,
            ['status' => $validated['status']],
            $request
        );

        return response()->json([
            'message' => 'Feedback status updated.',
            'feedback' => $feedback->fresh(['challenge:id,title,slug', 'reporter:id,name', 'resolver:id,name']),
        ]);
    }

    // -------------------------------------------------------------------------
    // Phase 5: Analytics, Audit Search & Safe Platform Settings
    // -------------------------------------------------------------------------

    public function analytics(): JsonResponse
    {
        $days = collect(range(13, 0))->map(fn (int $offset) => now()->subDays($offset)->toDateString());

        $submissionsByDay = Submission::where('created_at', '>=', now()->subDays(14))
            ->get(['created_at', 'status'])
            ->groupBy(fn ($s) => $s->created_at->toDateString());

        $registrationsByDay = User::where('created_at', '>=', now()->subDays(14))
            ->get(['created_at'])
            ->groupBy(fn ($u) => $u->created_at->toDateString());

        $dailySeries = $days->map(function (string $date) use ($submissionsByDay, $registrationsByDay) {
            $daySubs = $submissionsByDay->get($date, collect());
            return [
                'date' => $date,
                'submissions' => $daySubs->count(),
                'accepted' => $daySubs->where('status', 'accepted')->count(),
                'registrations' => $registrationsByDay->get($date, collect())->count(),
            ];
        })->values();

        $difficultyStats = Challenge::withCount([
            'submissions',
            'submissions as accepted_submissions_count' => fn ($q) => $q->where('status', 'accepted'),
        ])->get()->groupBy('difficulty')->map(function ($group, $difficulty) {
            $total = $group->sum('submissions_count');
            $accepted = $group->sum('accepted_submissions_count');
            return [
                'difficulty' => $difficulty,
                'challenges' => $group->count(),
                'submissions' => $total,
                'pass_rate' => $total > 0 ? round(($accepted / $total) * 100, 1) : 0,
            ];
        })->values();

        $topReported = Challenge::whereHas('feedback')
            ->withCount([
                'feedback as open_reports_count' => fn ($q) => $q->whereIn('status', ['open', 'in_progress']),
                'feedback as total_reports_count',
            ])
            ->orderByDesc('open_reports_count')
            ->limit(6)
            ->get(['id', 'title', 'slug', 'availability_status']);

        return response()->json([
            'daily_activity' => $dailySeries,
            'difficulty_performance' => $difficultyStats,
            'top_reported_challenges' => $topReported,
        ]);
    }

    public function auditLogs(Request $request): JsonResponse
    {
        $query = AuditLog::with('actor:id,name,email,role');

        if ($request->filled('action') && $request->action !== 'all') {
            $query->where('action', 'like', $request->action . '%');
        }

        if ($request->filled('target_type') && $request->target_type !== 'all') {
            $query->where('target_type', $request->target_type);
        }

        if ($request->filled('search')) {
            $term = '%' . mb_strtolower(trim((string) $request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(summary) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(action) LIKE ?', [$term]);
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        return response()->json($query->orderByDesc('created_at')->paginate(25));
    }

    public function getSettings(): JsonResponse
    {
        return response()->json([
            'settings' => PlatformSettingService::allGrouped(),
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        $changed = PlatformSettingService::updateMany($validated['settings'], $request->user());

        if (!empty($changed)) {
            AuditService::record(
                $request->user(),
                'setting.updated',
                'Updated platform settings: ' . implode(', ', array_keys($changed)),
                'platform_setting',
                null,
                ['changes' => $changed],
                $request
            );
        }

        return response()->json([
            'message' => 'Platform settings saved.',
            'changed_keys' => array_keys($changed),
            'settings' => PlatformSettingService::allGrouped(),
        ]);
    }
}
