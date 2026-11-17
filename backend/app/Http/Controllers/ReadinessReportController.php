<?php

namespace App\Http\Controllers;

use App\Models\ReadinessReport;
use App\Models\ReportShareToken;
use App\Models\SkillEvidence;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReadinessReportController extends Controller
{
    public function generate(Request $request): JsonResponse
    {
        $user = $request->user();

        $evidence = SkillEvidence::where('user_id', $user->id)->get();
        $totalSolved = Submission::where('user_id', $user->id)
            ->where('status', 'accepted')
            ->distinct('challenge_id')
            ->count('challenge_id');

        $totalSubmissions = Submission::where('user_id', $user->id)->count();

        // Calculate average telemetry integrity confidence
        $telemetrySubmissions = Submission::where('user_id', $user->id)
            ->whereNotNull('telemetry')
            ->get();
        $avgIntegrity = $telemetrySubmissions->count() > 0
            ? (int) round($telemetrySubmissions->avg(fn($s) => $s->telemetry['integrity_confidence_score'] ?? 100))
            : 98;

        $postMortemCount = \App\Models\ChallengePostMortem::where('user_id', $user->id)->count();
        $chaosResilientCount = Submission::where('user_id', $user->id)
            ->whereNotNull('chaos_results')
            ->where('chaos_results->status', 'RESILIENT')
            ->count();

        // Calculate verified evidence score
        $score = $evidence->count() > 0 ? (int) round($evidence->avg('score')) : 0;

        $readinessLevel = 'Early Foundations';
        if ($score >= 80 && $totalSolved >= 4) {
            $readinessLevel = 'Job-Ready: Associate Software Engineer';
        } elseif ($score >= 50 && $totalSolved >= 2) {
            $readinessLevel = 'Demonstrating Core Problem-Solving Competence';
        }

        $summary = "Candidate demonstrates empirical proficiency across {$evidence->count()} assessed algorithm domains, with {$totalSolved} fully verified challenge implementations and {$totalSubmissions} recorded execution cycles.";

        $methodology = "Scoring is strictly derived from automated, isolated test harness evaluations across public and private boundary test suites. Partial credit is awarded based on ratio of passed assertions, algorithmic time complexity adherence, and progressive hint independence.";

        $limitations = "BugQuest AI assessment metrics reflect observed problem-solving capability within standardized coding challenges. Scores do not constitute a guarantee of commercial employment, nor do they measure domain-specific system design, team collaboration, or soft skills.";

        $report = ReadinessReport::create([
            'user_id' => $user->id,
            'report_uuid' => (string) Str::uuid(),
            'title' => "Workforce Readiness Report — {$user->name}",
            'overall_readiness_score' => $score,
            'readiness_level' => $readinessLevel,
            'summary' => $summary,
            'methodology_notes' => $methodology,
            'limitations_disclaimer' => $limitations,
            'included_metrics' => [
                'show_topics' => true,
                'show_challenges_solved' => true,
                'show_diagnostics' => true,
                'target_role' => $user->target_role,
                'integrity_confidence_score' => $avgIntegrity,
                'post_mortem_count' => $postMortemCount,
                'chaos_resilient_count' => $chaosResilientCount,
            ],
            'skill_breakdown' => $evidence->map(fn($e) => [
                'topic' => $e->topic,
                'score' => $e->score,
                'proficiency_level' => $e->proficiency_level,
                'challenges_passed' => $e->challenges_passed,
                'total_submissions' => $e->total_submissions,
            ])->toArray(),
            'verified_evidence_count' => $totalSolved,
        ]);

        return response()->json([
            'message' => 'Readiness report generated',
            'report' => $report,
        ], 201);
    }

    public function getReport(Request $request, string $uuid): JsonResponse
    {
        $user = $request->user();

        $report = ReadinessReport::with('shareTokens')
            ->where('report_uuid', $uuid)
            ->where('user_id', $user->id)
            ->firstOrFail();

        return response()->json([
            'report' => $report,
        ]);
    }

    public function listUserReports(Request $request): JsonResponse
    {
        $user = $request->user();

        $reports = ReadinessReport::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'reports' => $reports,
        ]);
    }

    public function createShareToken(Request $request, string $uuid): JsonResponse
    {
        $user = $request->user();

        $report = ReadinessReport::where('report_uuid', $uuid)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $validated = $request->validate([
            'allow_code_samples' => 'boolean',
            'allow_diagnostics' => 'boolean',
            'expires_days' => 'nullable|integer|min:1|max:90',
        ]);

        $shareToken = bin2hex(random_bytes(32)); // 64-char crypto secure string
        $expiresAt = !empty($validated['expires_days'])
            ? now()->addDays($validated['expires_days'])
            : now()->addDays(30);

        $token = ReportShareToken::create([
            'readiness_report_id' => $report->id,
            'share_token' => $shareToken,
            'is_revoked' => false,
            'allow_code_samples' => $validated['allow_code_samples'] ?? false,
            'allow_diagnostics' => $validated['allow_diagnostics'] ?? true,
            'expires_at' => $expiresAt,
        ]);

        return response()->json([
            'message' => 'Share link created with explicit consent scopes',
            'share_token' => $token->share_token,
            'share_url' => url("/report/shared/{$token->share_token}"),
            'expires_at' => $token->expires_at->toIso8601String(),
            'token' => $token,
        ], 201);
    }

    public function revokeShareToken(Request $request, string $shareToken): JsonResponse
    {
        $user = $request->user();

        $token = ReportShareToken::where('share_token', $shareToken)
            ->whereHas('report', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->firstOrFail();

        $token->update(['is_revoked' => true]);

        return response()->json([
            'message' => 'Share token revoked successfully. The link is no longer accessible.',
        ]);
    }

    public function getPublicSharedReport(string $shareToken): JsonResponse
    {
        $token = ReportShareToken::with(['report.user'])->where('share_token', $shareToken)->first();

        if (!$token || !$token->isValid()) {
            return response()->json([
                'message' => 'This report link is invalid, expired, or has been revoked by the learner.',
            ], 404);
        }

        // Increment verified view analytics
        $token->increment('views_count');
        $token->update(['last_viewed_at' => now()]);

        $report = $token->report;
        $user = $report->user;

        // Return sanitized public report (respecting consent preferences)
        return response()->json([
            'shared_report' => [
                'title' => $report->title,
                'candidate_name' => $user->name,
                'target_role' => $user->target_role,
                'overall_readiness_score' => $report->overall_readiness_score,
                'readiness_level' => $report->readiness_level,
                'summary' => $report->summary,
                'methodology_notes' => $report->methodology_notes,
                'limitations_disclaimer' => $report->limitations_disclaimer,
                'verified_evidence_count' => $report->verified_evidence_count,
                'generated_at' => $report->generated_at->toFormattedDateString(),
                'skill_breakdown' => $token->allow_diagnostics ? $report->skill_breakdown : [],
                'sharing_settings' => [
                    'allow_diagnostics' => $token->allow_diagnostics,
                    'allow_code_samples' => $token->allow_code_samples,
                    'views_count' => $token->views_count,
                    'expires_at' => $token->expires_at?->toFormattedDateString(),
                ]
            ]
        ]);
    }
}
