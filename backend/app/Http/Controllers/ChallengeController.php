<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use App\Models\ChallengeTestCase;
use App\Models\Submission;
use App\Services\CodeJudgeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChallengeController extends Controller
{
    protected CodeJudgeService $judgeService;

    public function __construct(CodeJudgeService $judgeService)
    {
        $this->judgeService = $judgeService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Challenge::where('is_active', true);

        // Filter by difficulty
        if ($request->filled('difficulty') && $request->difficulty !== 'all') {
            $query->where('difficulty', $request->difficulty);
        }

        // Filter by category
        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Filter by topic
        if ($request->filled('topic') && $request->topic !== 'all') {
            $query->whereJsonContains('topics', $request->topic);
        }

        // Search in title / description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $challenges = $query->orderBy('order_index')->get();

        // If user is authenticated, attach solved status
        $user = $request->user('sanctum');
        $solvedIds = [];
        if ($user) {
            $solvedIds = Submission::where('user_id', $user->id)
                ->where('status', 'accepted')
                ->pluck('challenge_id')
                ->unique()
                ->toArray();
        }

        $formatted = $challenges->map(function ($c) use ($solvedIds) {
            return [
                'id' => $c->id,
                'slug' => $c->slug,
                'title' => $c->title,
                'difficulty' => $c->difficulty,
                'category' => $c->category,
                'framework' => $c->framework,
                'investigation_time_minutes' => $c->investigation_time_minutes ?? 25,
                'bug_report' => $c->bug_report ? [
                    'issue_title' => $c->bug_report['issue_title'] ?? $c->title,
                    'symptoms' => $c->bug_report['symptoms'] ?? null,
                ] : null,
                'topics' => $c->topics ?? [],
                'supported_languages' => $c->supported_languages ?? ['javascript', 'python'],
                'time_limit_ms' => $c->time_limit_ms,
                'memory_limit_mb' => $c->memory_limit_mb,
                'has_repository' => !empty($c->repository_files),
                'file_count' => is_array($c->repository_files) ? count($c->repository_files) : 0,
                'is_solved' => in_array($c->id, $solvedIds),
            ];
        });

        // Collect all unique topics and categories for filter tabs
        $allTopics = Challenge::where('is_active', true)
            ->pluck('topics')
            ->flatten()
            ->unique()
            ->values();

        $allCategories = Challenge::where('is_active', true)
            ->whereNotNull('category')
            ->pluck('category')
            ->unique()
            ->values();

        return response()->json([
            'challenges' => $formatted,
            'topics' => $allTopics,
            'categories' => $allCategories,
            'total' => $formatted->count(),
        ]);
    }

    public function show(Request $request, string $slugOrId): JsonResponse
    {
        $challenge = Challenge::where('slug', $slugOrId)
            ->orWhere('id', $slugOrId)
            ->firstOrFail();

        // ONLY expose public test cases to protect assessment integrity
        $publicTestCases = $challenge->publicTestCases()->get()->map(function ($tc) {
            return [
                'id' => $tc->id,
                'input' => $tc->input,
                'expected_output' => $tc->expected_output,
                'explanation' => $tc->explanation,
            ];
        });

        $user = $request->user('sanctum');
        $userSubmissions = [];
        $isSolved = false;

        if ($user) {
            $userSubmissions = Submission::where('user_id', $user->id)
                ->where('challenge_id', $challenge->id)
                ->orderByDesc('created_at')
                ->take(10)
                ->get()
                ->map(fn($s) => [
                    'id' => $s->id,
                    'status' => $s->status,
                    'language' => $s->language,
                    'pass_count' => $s->pass_count,
                    'total_count' => $s->total_count,
                    'execution_time_ms' => $s->execution_time_ms,
                    'patch_diff' => $s->patch_diff,
                    'hypothesis' => $s->hypothesis,
                    'created_at' => $s->created_at->toIso8601String(),
                ]);

            $isSolved = Submission::where('user_id', $user->id)
                ->where('challenge_id', $challenge->id)
                ->where('status', 'accepted')
                ->exists();
        }

        // Clean repository files: NEVER leak reference_patch or hidden test files to learners
        $repositoryFiles = $challenge->repository_files ?? [];

        return response()->json([
            'challenge' => [
                'id' => $challenge->id,
                'slug' => $challenge->slug,
                'title' => $challenge->title,
                'difficulty' => $challenge->difficulty,
                'category' => $challenge->category,
                'framework' => $challenge->framework,
                'investigation_time_minutes' => $challenge->investigation_time_minutes ?? 25,
                'description' => $challenge->description,
                'bug_report' => $challenge->bug_report,
                'repository_files' => $repositoryFiles,
                'entrypoint_test' => $challenge->entrypoint_test,
                'input_spec' => $challenge->input_spec,
                'output_spec' => $challenge->output_spec,
                'constraints' => $challenge->constraints ?? [],
                'public_examples' => $challenge->public_examples ?? [],
                'starter_code' => $challenge->starter_code ?? [],
                'supported_languages' => $challenge->supported_languages ?? ['javascript', 'python'],
                'topics' => $challenge->topics ?? [],
                'time_limit_ms' => $challenge->time_limit_ms,
                'memory_limit_mb' => $challenge->memory_limit_mb,
                'editorial' => $challenge->editorial,
                'public_test_cases' => $publicTestCases,
                'is_solved' => $isSolved,
                'user_submissions' => $userSubmissions,
            ]
        ]);
    }

    /**
     * Admin/Instructor: Create a new challenge
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['admin', 'educator'])) {
            return response()->json(['message' => 'Unauthorized. Only instructors or admins can author challenges.'], 403);
        }

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
            'editorial' => 'nullable|string',
            'test_cases' => 'nullable|array',
        ]);

        $slug = Str::slug($validated['title']) . '-' . Str::random(5);

        $challenge = Challenge::create([
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
            'editorial' => $validated['editorial'] ?? null,
            'time_limit_ms' => 2000,
            'memory_limit_mb' => 128,
            'is_active' => true,
        ]);

        if (!empty($validated['test_cases'])) {
            foreach ($validated['test_cases'] as $index => $tc) {
                ChallengeTestCase::create([
                    'challenge_id' => $challenge->id,
                    'input' => $tc['input'] ?? '',
                    'expected_output' => $tc['expected_output'] ?? '',
                    'is_hidden' => $tc['is_hidden'] ?? false,
                    'explanation' => $tc['explanation'] ?? null,
                    'order_index' => $index,
                ]);
            }
        }

        return response()->json([
            'message' => 'Challenge created successfully',
            'challenge' => $challenge->load('testCases'),
        ], 201);
    }

    /**
     * Authoring / Bug Mutation Lab: Validate that defect reproduces and reference patch passes.
     */
    public function validateChallenge(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['admin', 'educator'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $challenge = Challenge::findOrFail($id);

        if (empty($challenge->repository_files) || empty($challenge->reference_patch)) {
            return response()->json([
                'valid' => false,
                'message' => 'Challenge requires both repository_files and reference_patch for automated mutation validation.',
            ], 422);
        }

        $lang = $challenge->supported_languages[0] ?? 'javascript';

        // 1. Run unmodified repository: MUST FAIL test suite (reproducing the reported defect)
        $unmodifiedEval = $this->judgeService->evaluate($challenge, $lang, '', []);

        // 2. Run repository with reference patch applied: MUST PASS 100% of test suite
        $patchedEval = $this->judgeService->evaluate($challenge, $lang, '', $challenge->reference_patch);

        $defectReproduced = ($unmodifiedEval['status'] !== 'accepted');
        $referenceFixPasses = ($patchedEval['status'] === 'accepted');
        $isValid = $defectReproduced && $referenceFixPasses;

        return response()->json([
            'valid' => $isValid,
            'defect_reproduced' => $defectReproduced,
            'unmodified_status' => $unmodifiedEval['status'],
            'unmodified_error' => $unmodifiedEval['error_output'],
            'reference_fix_passes' => $referenceFixPasses,
            'patched_status' => $patchedEval['status'],
            'patched_pass_count' => $patchedEval['pass_count'],
            'patched_total_count' => $patchedEval['total_count'],
            'summary' => $isValid
                ? 'Challenge successfully validated: Defect reproduces in starter code, and reference fix passes 100% of tests.'
                : 'Validation failed: Check that original defect fails tests and reference patch resolves all tests.',
        ]);
    }
}
