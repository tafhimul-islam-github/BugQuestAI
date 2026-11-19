<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use App\Models\ChallengeTestCase;
use App\Models\Submission;
use App\Services\CodeJudgeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            $topic = mb_strtolower(trim((string) $request->topic));
            $topicPatterns = array_unique([
                "%{$topic}%",
                '%' . str_replace(' ', '_', $topic) . '%',
            ]);
            $jsonCastType = DB::connection()->getDriverName() === 'mysql' ? 'CHAR' : 'TEXT';

            $query->where(function ($q) use ($request, $topicPatterns, $jsonCastType) {
                $q->whereJsonContains('topics', $request->topic);
                foreach ($topicPatterns as $pattern) {
                    $q->orWhereRaw("LOWER(CAST(topics AS {$jsonCastType})) LIKE ?", [$pattern]);
                }
            });
        }

        // Search across user-visible challenge metadata and repository content.
        if (trim((string) $request->input('search', '')) !== '') {
            $search = trim((string) $request->search);
            $searchTerm = mb_strtolower($search);
            $normalizedCategoryTerm = str_replace([' ', '-'], '_', $searchTerm);
            $displayCategoryTerm = str_replace(['_', '-'], ' ', $searchTerm);
            $searchPatterns = array_unique([
                "%{$searchTerm}%",
                '%' . str_replace(' ', '_', $searchTerm) . '%',
                '%' . $normalizedCategoryTerm . '%',
                '%' . $displayCategoryTerm . '%',
            ]);
            $jsonCastType = DB::connection()->getDriverName() === 'mysql' ? 'CHAR' : 'TEXT';

            $query->where(function ($q) use ($searchTerm, $normalizedCategoryTerm, $displayCategoryTerm, $searchPatterns, $jsonCastType) {
                $pattern = "%{$searchTerm}%";
                $q->whereRaw('LOWER(title) LIKE ?', [$pattern])
                  ->orWhereRaw('LOWER(description) LIKE ?', [$pattern])
                  ->orWhereRaw('LOWER(category) LIKE ?', [$pattern])
                  ->orWhereRaw('LOWER(framework) LIKE ?', [$pattern])
                  ->orWhereRaw("LOWER(REPLACE(category, '_', ' ')) LIKE ?", ['%' . $displayCategoryTerm . '%'])
                  ->orWhereRaw("LOWER(REPLACE(category, '-', ' ')) LIKE ?", ['%' . $displayCategoryTerm . '%'])
                  ->orWhereRaw('LOWER(category) LIKE ?', ['%' . $normalizedCategoryTerm . '%']);

                foreach (['bug_report', 'repository_files', 'topics'] as $column) {
                    $expression = "LOWER(CAST({$column} AS {$jsonCastType})) LIKE ?";
                    foreach ($searchPatterns as $pattern) {
                        $q->orWhereRaw($expression, [$pattern]);
                    }
                }
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
            ->map(fn ($topic) => trim((string) $topic))
            ->filter()
            ->unique(fn ($topic) => mb_strtolower(str_replace('_', ' ', $topic)))
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

        $user = $request->user('sanctum');
        if (!$challenge->is_active) {
            $canPreview = $user && ($user->isAdmin() || ($user->isEducator() && $challenge->author_id === $user->id));
            if (!$canPreview) {
                return response()->json(['message' => 'Challenge is not currently available.'], 404);
            }
        }

        // ONLY expose public test cases to protect assessment integrity
        $publicTestCases = $challenge->publicTestCases()->get()->map(function ($tc) {
            return [
                'id' => $tc->id,
                'input' => $tc->input,
                'expected_output' => $tc->expected_output,
                'explanation' => $tc->explanation,
            ];
        });

        $userSubmissions = [];
        $isSolved = false;

        if ($user) {
            $userSubmissions = Submission::where('user_id', $user->id)
                ->where('challenge_id', $challenge->id)
                ->orderByDesc('created_at')
                ->take(20)
                ->get()
                ->map(fn($s) => [
                    'id' => $s->id,
                    'status' => $s->status,
                    'language' => $s->language,
                    'code' => $s->code,
                    'modified_files' => $s->modified_files,
                    'pass_count' => $s->pass_count,
                    'total_count' => $s->total_count,
                    'execution_time_ms' => $s->execution_time_ms,
                    'memory_kb' => $s->memory_kb,
                    'error_output' => $s->error_output,
                    'public_test_results' => $s->public_test_results,
                    'patch_diff' => $s->patch_diff,
                    'hypothesis' => $s->hypothesis,
                    'telemetry' => $s->telemetry,
                    'chaos_results' => $s->chaos_results,
                    'created_at' => $s->created_at->toIso8601String(),
                ]);

            $isSolved = Submission::where('user_id', $user->id)
                ->where('challenge_id', $challenge->id)
                ->where('status', 'accepted')
                ->exists();
        }

        // Community submissions: show other users' submission activity & metrics for this problem,
        // but NEVER include code, modified_files, or patch_diff to prevent solution leakage.
        $communitySubmissions = Submission::with('user:id,name,role,target_role')
            ->where('challenge_id', $challenge->id)
            ->orderByDesc('created_at')
            ->take(25)
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'user_name' => $s->user ? $s->user->name : 'Anonymous Learner',
                'user_role' => $s->user ? ($s->user->target_role ?: ucfirst($s->user->role)) : 'Developer',
                'is_own' => $user ? ($s->user_id === $user->id) : false,
                'status' => $s->status,
                'language' => $s->language,
                'pass_count' => $s->pass_count,
                'total_count' => $s->total_count,
                'execution_time_ms' => $s->execution_time_ms,
                'memory_kb' => $s->memory_kb,
                'created_at' => $s->created_at->toIso8601String(),
            ]);

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
                'telemetry_traces' => $challenge->telemetry_traces,
                'time_limit_ms' => $challenge->time_limit_ms,
                'memory_limit_mb' => $challenge->memory_limit_mb,
                'editorial' => $challenge->editorial,
                'public_test_cases' => $publicTestCases,
                'is_solved' => $isSolved,
                'user_submissions' => $userSubmissions,
                'community_submissions' => $communitySubmissions,
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
        $isAdmin = $user->isAdmin();

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
            'editorial' => $validated['editorial'] ?? null,
            'time_limit_ms' => 2000,
            'memory_limit_mb' => 128,
            'is_active' => $isAdmin,
            'review_status' => $isAdmin ? Challenge::REVIEW_APPROVED : Challenge::REVIEW_DRAFT,
            'availability_status' => $isAdmin ? Challenge::AVAILABILITY_PUBLISHED : Challenge::AVAILABILITY_UNPUBLISHED,
            'published_at' => $isAdmin ? now() : null,
            'version' => 1,
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

        $challenge->forceFill([
            'last_validated_at' => now(),
            'last_validation_passed' => $isValid,
        ])->save();

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

    public function importGithub(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['admin', 'educator'])) {
            return response()->json(['message' => 'Unauthorized. Only instructors or admins can author or import challenges.'], 403);
        }

        $validated = $request->validate([
            'repo_url' => 'required|string|url|max:255',
            'issue_description' => 'required|string|min:20|max:10000',
            'framework' => 'nullable|string|max:50',
            'difficulty' => 'nullable|in:beginner,intermediate,advanced',
        ]);

        $aiSynthesized = null;
        try {
            $response = \Illuminate\Support\Facades\Http::timeout(6)->post('http://127.0.0.1:8001/api/v1/byob/sanitize-import', [
                'repo_url' => $validated['repo_url'],
                'issue_description' => $validated['issue_description'],
                'framework' => $validated['framework'] ?? 'Node.js',
                'difficulty' => $validated['difficulty'] ?? 'intermediate',
            ]);
            if ($response->successful()) {
                $aiSynthesized = $response->json();
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('AI BYOB Service unavailable, falling back to local synthesizer: ' . $e->getMessage());
        }

        if (!$aiSynthesized) {
            $slugBase = basename(parse_url($validated['repo_url'], PHP_URL_PATH) ?: 'repo-defect');
            $aiSynthesized = [
                'title' => 'BYOB: ' . ucwords(str_replace(['-', '_'], ' ', $slugBase)) . ' Issue',
                'slug' => 'byob-' . \Illuminate\Support\Str::slug($slugBase) . '-' . substr(md5(uniqid()), 0, 5),
                'difficulty' => $validated['difficulty'] ?? 'intermediate',
                'category' => 'logic_state',
                'framework' => $validated['framework'] ?? 'Node.js',
                'bug_report' => [
                    'issue_title' => 'Defect imported from ' . $validated['repo_url'],
                    'symptoms' => substr($validated['issue_description'], 0, 200),
                    'reproduction_steps' => ['1. Trigger request', '2. Observe failure'],
                    'expected_behavior' => 'Request succeeds cleanly',
                    'actual_behavior' => 'Unhandled defect encountered',
                ],
                'repository_files' => [
                    ['path' => 'src/handler.js', 'is_editable' => true, 'language' => 'javascript', 'content' => "function handle() { return true; }\nmodule.exports = { handle };"],
                    ['path' => 'tests/runner.cjs', 'is_editable' => false, 'language' => 'javascript', 'content' => "const { handle } = require('../src/handler');\nconsole.log(JSON.stringify({ tests: [{ name: 'Sanity', status: 'passed', passed: true }] }));"],
                ],
                'entrypoint_test' => 'tests/runner.cjs',
                'reference_patch' => [
                    ['path' => 'src/handler.js', 'content' => "function handle() { return true; }\nmodule.exports = { handle };"],
                ],
            ];
        }

        $isAdmin = $user->isAdmin();

        $challenge = Challenge::create([
            'author_id' => $user->id,
            'title' => $aiSynthesized['title'],
            'slug' => $aiSynthesized['slug'],
            'difficulty' => $aiSynthesized['difficulty'],
            'category' => $aiSynthesized['category'] ?? 'logic_state',
            'framework' => $aiSynthesized['framework'] ?? 'Node.js',
            'investigation_time_minutes' => 25,
            'description' => $validated['issue_description'],
            'bug_report' => $aiSynthesized['bug_report'],
            'repository_files' => $aiSynthesized['repository_files'],
            'entrypoint_test' => $aiSynthesized['entrypoint_test'],
            'reference_patch' => $aiSynthesized['reference_patch'] ?? [],
            'supported_languages' => ['javascript'],
            'topics' => ['byob', 'production_bug', 'sanitized_import'],
            'time_limit_ms' => 2000,
            'memory_limit_mb' => 128,
            'is_active' => $isAdmin,
            'review_status' => $isAdmin ? Challenge::REVIEW_APPROVED : Challenge::REVIEW_DRAFT,
            'availability_status' => $isAdmin ? Challenge::AVAILABILITY_PUBLISHED : Challenge::AVAILABILITY_UNPUBLISHED,
            'published_at' => $isAdmin ? now() : null,
            'version' => 1,
        ]);

        return response()->json([
            'message' => 'GitHub bug successfully sanitized and synthesized into production quest',
            'challenge' => $challenge,
        ], 201);
    }
}
