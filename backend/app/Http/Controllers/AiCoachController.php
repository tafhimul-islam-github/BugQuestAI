<?php

namespace App\Http\Controllers;

use App\Models\AiCoachingSession;
use App\Models\Challenge;
use App\Models\SkillEvidence;
use App\Models\Submission;
use App\Services\AiCoachService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiCoachController extends Controller
{
    protected AiCoachService $aiCoachService;

    public function __construct(AiCoachService $aiCoachService)
    {
        $this->aiCoachService = $aiCoachService;
    }

    public function requestHint(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'challenge_id' => 'required|exists:challenges,id',
            'hint_level' => 'required|in:nudge,direction,debugging_guidance,detailed_explanation',
            'language' => 'required|in:javascript,python',
            'code' => 'required|string|max:65536',
            'error_context' => 'nullable|string|max:2000',
            'submission_id' => 'nullable|exists:submissions,id',
        ]);

        $challenge = Challenge::findOrFail($validated['challenge_id']);
        $submission = !empty($validated['submission_id'])
            ? Submission::find($validated['submission_id'])
            : null;

        $hintResult = $this->aiCoachService->generateHint(
            $challenge,
            $validated['language'],
            $validated['code'],
            $validated['hint_level'],
            $validated['error_context'] ?? null,
            $submission
        );

        // Persist session record
        $session = AiCoachingSession::create([
            'user_id' => $user->id,
            'challenge_id' => $challenge->id,
            'submission_id' => $submission?->id,
            'hint_level' => $validated['hint_level'],
            'code_snippet' => substr($validated['code'], 0, 5000),
            'error_context' => $validated['error_context'] ?? null,
            'summary' => $hintResult['summary'] ?? 'Coaching Guidance',
            'likely_issue' => $hintResult['likely_issue'] ?? null,
            'explanation' => $hintResult['explanation'] ?? '',
            'next_steps' => $hintResult['next_steps'] ?? [],
            'concept_tags' => $hintResult['concept_tags'] ?? ($challenge->topics ?? []),
            'confidence' => $hintResult['confidence'] ?? 0.90,
            'model_used' => $hintResult['model_used'] ?? 'bugquest-coach',
            'tokens_used' => $hintResult['tokens_used'] ?? null,
        ]);

        // Increment hint usage in skill evidence for topic
        foreach ($challenge->topics ?? ['general'] as $topic) {
            SkillEvidence::where('user_id', $user->id)
                ->where('topic', $topic)
                ->increment('hints_requested_count');
        }

        return response()->json([
            'hint' => [
                'id' => $session->id,
                'hint_level' => $session->hint_level,
                'summary' => $session->summary,
                'likely_issue' => $session->likely_issue,
                'explanation' => $session->explanation,
                'next_steps' => $session->next_steps,
                'concept_tags' => $session->concept_tags,
                'confidence' => $session->confidence,
                'created_at' => $session->created_at->toIso8601String(),
            ]
        ]);
    }

    public function history(Request $request, int $challengeId): JsonResponse
    {
        $user = $request->user();

        $history = AiCoachingSession::where('user_id', $user->id)
            ->where('challenge_id', $challengeId)
            ->orderByDesc('created_at')
            ->take(10)
            ->get();

        return response()->json([
            'history' => $history,
        ]);
    }
}
