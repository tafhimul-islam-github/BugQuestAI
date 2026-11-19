<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use App\Models\ChallengeFeedback;
use App\Models\PanelNotification;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedbackNotificationController extends Controller
{
    /**
     * Authenticated user submits a bug report or feedback for a challenge.
     */
    public function reportChallengeIssue(Request $request, int $challengeId): JsonResponse
    {
        $challenge = Challenge::findOrFail($challengeId);

        $validated = $request->validate([
            'category' => 'required|in:bug_report,unclear_description,broken_test,hint_request,other',
            'severity' => 'nullable|in:low,medium,high',
            'title' => 'required|string|min:5|max:200',
            'description' => 'required|string|min:10|max:3000',
        ]);

        $user = $request->user();

        $feedback = ChallengeFeedback::create([
            'challenge_id' => $challenge->id,
            'reporter_id' => $user->id,
            'assigned_educator_id' => $challenge->author_id,
            'category' => $validated['category'],
            'severity' => $validated['severity'] ?? 'medium',
            'title' => $validated['title'],
            'description' => $validated['description'],
            'status' => 'open',
        ]);

        // Notify challenge author if assigned
        if ($challenge->author_id && $challenge->author_id !== $user->id) {
            AuditService::notify(
                $challenge->author_id,
                'feedback_reported',
                'New issue reported on "' . $challenge->title . '"',
                $validated['title'] . ' (' . str_replace('_', ' ', $validated['category']) . ')',
                '/educator/feedback'
            );
        }

        // Also notify admins for high severity reports
        if (($validated['severity'] ?? 'medium') === 'high') {
            $admins = User::where('role', 'admin')->where('id', '!=', $user->id)->pluck('id');
            foreach ($admins as $adminId) {
                AuditService::notify(
                    $adminId,
                    'feedback_reported',
                    'High-severity issue on "' . $challenge->title . '"',
                    $validated['title'],
                    '/admin'
                );
            }
        }

        return response()->json([
            'message' => 'Thank you. Your report has been routed to the challenge maintainers.',
            'feedback' => $feedback,
        ], 201);
    }

    /**
     * List current user's panel notifications.
     */
    public function notifications(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = PanelNotification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(30)
            ->get();

        $unreadCount = PanelNotification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markNotificationRead(Request $request, int $id): JsonResponse
    {
        $notification = PanelNotification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        PanelNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
