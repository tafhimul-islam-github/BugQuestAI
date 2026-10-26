<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use App\Models\Recommendation;
use App\Models\SkillEvidence;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LearningController extends Controller
{
    public function getSkillProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $evidence = SkillEvidence::where('user_id', $user->id)
            ->orderByDesc('score')
            ->get();

        $totalSolved = Submission::where('user_id', $user->id)
            ->where('status', 'accepted')
            ->distinct('challenge_id')
            ->count('challenge_id');

        $totalAvailable = Challenge::where('is_active', true)->count();

        // Calculate average score across topics with evidence
        $avgScore = $evidence->count() > 0
            ? round($evidence->avg('score'))
            : 0;

        // Categorize overall proficiency
        $overallProficiency = 'Developing';
        if ($avgScore >= 80 && $totalSolved >= 4) {
            $overallProficiency = 'Consistent Assessment Readiness';
        } elseif ($avgScore >= 50 && $totalSolved >= 2) {
            $overallProficiency = 'Demonstrating Steady Progress';
        }

        // Recent submission trends
        $recentSubmissions = Submission::with('challenge:id,title,slug,difficulty')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->take(6)
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'challenge_title' => $s->challenge->title,
                'status' => $s->status,
                'execution_time_ms' => $s->execution_time_ms,
                'created_at' => $s->created_at->diffForHumans(),
            ]);

        return response()->json([
            'profile' => [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'target_role' => $user->target_role,
                'overall_score' => $avgScore,
                'overall_proficiency' => $overallProficiency,
                'challenges_solved' => $totalSolved,
                'challenges_total' => $totalAvailable,
                'skills' => $evidence->map(fn($e) => [
                    'id' => $e->id,
                    'topic' => $e->topic,
                    'score' => $e->score,
                    'proficiency_level' => $e->proficiency_level,
                    'challenges_passed' => $e->challenges_passed,
                    'challenges_attempted' => $e->challenges_attempted,
                    'total_submissions' => $e->total_submissions,
                    'diagnostic_history' => $e->diagnostic_history ?? [],
                    'last_assessed' => $e->last_assessed_at?->diffForHumans() ?? 'Not yet assessed',
                ]),
                'recent_activity' => $recentSubmissions,
            ]
        ]);
    }

    public function getRecommendations(Request $request): JsonResponse
    {
        $user = $request->user();

        $recommendations = Recommendation::with('challenge:id,title,slug,difficulty,topics,description')
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($rec) {
                return [
                    'id' => $rec->id,
                    'reason' => $rec->reason,
                    'topic' => $rec->topic,
                    'challenge' => [
                        'id' => $rec->challenge->id,
                        'slug' => $rec->challenge->slug,
                        'title' => $rec->challenge->title,
                        'difficulty' => $rec->challenge->difficulty,
                        'topics' => $rec->challenge->topics,
                    ],
                    'created_at' => $rec->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'recommendations' => $recommendations,
        ]);
    }

    public function dismissRecommendation(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $recommendation = Recommendation::where('user_id', $user->id)->findOrFail($id);
        $recommendation->update(['status' => 'dismissed']);

        return response()->json([
            'message' => 'Recommendation dismissed',
        ]);
    }
}
