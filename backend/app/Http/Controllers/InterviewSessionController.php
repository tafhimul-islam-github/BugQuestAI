<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use App\Models\InterviewSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InterviewSessionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $request->user('sanctum') ?? $request->user();
        $fallbackUser = \App\Models\User::first();
        $interviewerId = $user ? $user->id : ($fallbackUser ? $fallbackUser->id : 1);

        $validated = $request->validate([
            'challenge_id' => 'required|exists:challenges,id',
            'candidate_name' => 'nullable|string|max:100',
            'candidate_email' => 'nullable|email|max:150',
        ]);

        $sessionCode = 'BQ-INT-' . strtoupper(Str::random(6));

        $session = InterviewSession::create([
            'session_code' => $sessionCode,
            'challenge_id' => $validated['challenge_id'],
            'interviewer_id' => $interviewerId,
            'candidate_name' => $validated['candidate_name'] ?? 'Candidate',
            'candidate_email' => $validated['candidate_email'] ?? null,
            'status' => 'active',
            'evaluation_rubric' => [
                'problem_solving_score' => 85,
                'code_quality_score' => 80,
                'communication_score' => 90,
                'overall_verdict' => 'HIRE_RECOMMENDED',
            ],
        ]);

        return response()->json([
            'message' => 'Live collaborative interview room created',
            'session' => $session->load('challenge'),
        ], 201);
    }

    public function show(string $sessionCode): JsonResponse
    {
        $session = InterviewSession::with(['challenge', 'interviewer:id,name,role'])
            ->where('session_code', $sessionCode)
            ->firstOrFail();

        return response()->json([
            'session' => $session,
        ]);
    }

    public function evaluate(Request $request, string $sessionCode): JsonResponse
    {
        $user = $request->user();

        $session = InterviewSession::where('session_code', $sessionCode)->firstOrFail();

        $validated = $request->validate([
            'interviewer_notes' => 'nullable|string|max:10000',
            'evaluation_rubric' => 'required|array',
            'evaluation_rubric.problem_solving_score' => 'required|integer|min:0|max:100',
            'evaluation_rubric.code_quality_score' => 'required|integer|min:0|max:100',
            'evaluation_rubric.communication_score' => 'required|integer|min:0|max:100',
            'evaluation_rubric.overall_verdict' => 'required|string',
            'status' => 'nullable|string|in:active,completed',
        ]);

        $session->update([
            'interviewer_notes' => $validated['interviewer_notes'] ?? $session->interviewer_notes,
            'evaluation_rubric' => $validated['evaluation_rubric'],
            'status' => $validated['status'] ?? 'completed',
        ]);

        return response()->json([
            'message' => 'Interview evaluation submitted and sealed',
            'session' => $session,
        ]);
    }
}
