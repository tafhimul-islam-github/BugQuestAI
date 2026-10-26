<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use App\Models\ChallengeTestCase;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChallengeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Challenge::where('is_active', true);

        // Filter by difficulty
        if ($request->filled('difficulty') && $request->difficulty !== 'all') {
            $query->where('difficulty', $request->difficulty);
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
                'topics' => $c->topics ?? [],
                'supported_languages' => $c->supported_languages ?? ['javascript', 'python'],
                'time_limit_ms' => $c->time_limit_ms,
                'memory_limit_mb' => $c->memory_limit_mb,
                'is_solved' => in_array($c->id, $solvedIds),
            ];
        });

        // Collect all unique topics for filter tabs
        $allTopics = Challenge::where('is_active', true)
            ->pluck('topics')
            ->flatten()
            ->unique()
            ->values();

        return response()->json([
            'challenges' => $formatted,
            'topics' => $allTopics,
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
                    'created_at' => $s->created_at->toIso8601String(),
                ]);

            $isSolved = Submission::where('user_id', $user->id)
                ->where('challenge_id', $challenge->id)
                ->where('status', 'accepted')
                ->exists();
        }

        return response()->json([
            'challenge' => [
                'id' => $challenge->id,
                'slug' => $challenge->slug,
                'title' => $challenge->title,
                'difficulty' => $challenge->difficulty,
                'description' => $challenge->description,
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

    public function adminStore(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden: Admin access required.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'description' => 'required|string',
            'input_spec' => 'nullable|string',
            'output_spec' => 'nullable|string',
            'constraints' => 'nullable|array',
            'public_examples' => 'nullable|array',
            'starter_code' => 'required|array',
            'supported_languages' => 'required|array',
            'topics' => 'required|array',
            'time_limit_ms' => 'nullable|integer',
            'memory_limit_mb' => 'nullable|integer',
            'test_cases' => 'required|array|min:1',
            'test_cases.*.input' => 'required|string',
            'test_cases.*.expected_output' => 'required|string',
            'test_cases.*.is_hidden' => 'required|boolean',
            'test_cases.*.explanation' => 'nullable|string',
        ]);

        $slug = Str::slug($validated['title']);
        $originalSlug = $slug;
        $counter = 1;
        while (Challenge::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }

        $challenge = Challenge::create([
            'slug' => $slug,
            'title' => $validated['title'],
            'difficulty' => $validated['difficulty'],
            'description' => $validated['description'],
            'input_spec' => $validated['input_spec'] ?? null,
            'output_spec' => $validated['output_spec'] ?? null,
            'constraints' => $validated['constraints'] ?? [],
            'public_examples' => $validated['public_examples'] ?? [],
            'starter_code' => $validated['starter_code'],
            'supported_languages' => $validated['supported_languages'],
            'topics' => $validated['topics'],
            'time_limit_ms' => $validated['time_limit_ms'] ?? 2000,
            'memory_limit_mb' => $validated['memory_limit_mb'] ?? 128,
        ]);

        foreach ($validated['test_cases'] as $index => $tc) {
            ChallengeTestCase::create([
                'challenge_id' => $challenge->id,
                'input' => $tc['input'],
                'expected_output' => $tc['expected_output'],
                'is_hidden' => $tc['is_hidden'],
                'explanation' => $tc['explanation'] ?? null,
                'order_index' => $index + 1,
            ]);
        }

        return response()->json([
            'message' => 'Challenge created successfully',
            'challenge' => $challenge,
        ], 201);
    }
}
