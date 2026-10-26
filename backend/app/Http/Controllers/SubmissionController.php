<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use App\Models\Submission;
use App\Services\CodeJudgeService;
use App\Services\SkillIntelligenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubmissionController extends Controller
{
    protected CodeJudgeService $judgeService;
    protected SkillIntelligenceService $skillService;

    public function __construct(CodeJudgeService $judgeService, SkillIntelligenceService $skillService)
    {
        $this->judgeService = $judgeService;
        $this->skillService = $skillService;
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'challenge_id' => 'required|exists:challenges,id',
            'language' => 'required|in:javascript,python',
            'code' => 'required|string|max:65536', // 64KB max code size
            'idempotency_key' => 'nullable|string|max:64',
        ]);

        // Idempotency check: if submitted with identical key in last 10 seconds, return existing
        if (!empty($validated['idempotency_key'])) {
            $existing = Submission::where('user_id', $user->id)
                ->where('idempotency_key', $validated['idempotency_key'])
                ->where('created_at', '>=', now()->subSeconds(10))
                ->first();

            if ($existing) {
                return response()->json([
                    'message' => 'Duplicate submission resolved via idempotency',
                    'submission' => $existing,
                ]);
            }
        }

        $challenge = Challenge::findOrFail($validated['challenge_id']);

        // Dispatch assessment to isolated code judge
        $evalResult = $this->judgeService->evaluate(
            $challenge,
            $validated['language'],
            $validated['code']
        );

        // Persist submission record
        $submission = Submission::create([
            'user_id' => $user->id,
            'challenge_id' => $challenge->id,
            'language' => $validated['language'],
            'code' => $validated['code'],
            'status' => $evalResult['status'],
            'pass_count' => $evalResult['pass_count'],
            'total_count' => $evalResult['total_count'],
            'execution_time_ms' => $evalResult['execution_time_ms'],
            'memory_kb' => $evalResult['memory_kb'],
            'error_output' => $evalResult['error_output'],
            'public_test_results' => $evalResult['public_test_results'],
            'judge_provider' => $evalResult['judge_provider'] ?? 'isolated_sandbox',
            'idempotency_key' => $validated['idempotency_key'] ?? null,
        ]);

        // Update learner skill evidence and recommendations
        $this->skillService->recordSubmissionOutcome($submission);

        return response()->json([
            'message' => 'Assessment completed',
            'submission' => [
                'id' => $submission->id,
                'status' => $submission->status,
                'pass_count' => $submission->pass_count,
                'total_count' => $submission->total_count,
                'execution_time_ms' => $submission->execution_time_ms,
                'memory_kb' => $submission->memory_kb,
                'error_output' => $submission->error_output,
                'public_test_results' => $submission->public_test_results,
                'created_at' => $submission->created_at->toIso8601String(),
            ]
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Submission::with('challenge:id,title,slug,difficulty')
            ->where('user_id', $user->id);

        if ($request->filled('challenge_id')) {
            $query->where('challenge_id', $request->challenge_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $submissions = $query->orderByDesc('created_at')->paginate(15);

        return response()->json($submissions);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $submission = Submission::with('challenge:id,title,slug,difficulty')->findOrFail($id);

        // Authorization check: only owner or educator/admin can view
        if ($submission->user_id !== $user->id && !$user->isEducator() && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized access to submission'], 403);
        }

        return response()->json([
            'submission' => $submission,
        ]);
    }
}
