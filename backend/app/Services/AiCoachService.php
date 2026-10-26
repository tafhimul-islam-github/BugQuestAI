<?php

namespace App\Services;

use App\Models\Challenge;
use App\Models\Submission;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiCoachService
{
    protected string $aiServiceUrl;

    public function __construct()
    {
        $this->aiServiceUrl = env('AI_SERVICE_URL', 'http://localhost:8001');
    }

    /**
     * Request progressive debugging hint from AI Service or pedagogical fallback.
     */
    public function generateHint(
        Challenge $challenge,
        string $language,
        string $code,
        string $hintLevel,
        ?string $errorContext = null,
        ?Submission $submission = null
    ): array {
        // Enforce progressive levels
        $validLevels = ['nudge', 'direction', 'debugging_guidance', 'detailed_explanation'];
        if (!in_array($hintLevel, $validLevels)) {
            $hintLevel = 'nudge';
        }

        // Prepare payload strictly omitting hidden test cases
        $payload = [
            'challenge_title' => $challenge->title,
            'challenge_description' => $challenge->description,
            'constraints' => $challenge->constraints ?? [],
            'public_examples' => $challenge->public_examples ?? [],
            'language' => $language,
            'code' => $code,
            'hint_level' => $hintLevel,
            'error_context' => $errorContext,
            'normalized_status' => $submission?->status ?? 'attempting',
            'topics' => $challenge->topics ?? [],
        ];

        // 1. Attempt calling the dedicated FastAPI AI Service
        try {
            $response = Http::timeout(2)->post("{$this->aiServiceUrl}/api/v1/hint", $payload);

            if ($response->successful()) {
                $data = $response->json();
                if (!empty($data['summary']) && !empty($data['explanation'])) {
                    return $data;
                }
            }
        } catch (\Exception $e) {
            Log::info("FastAPI service unreachable, activating structured fallback coach: " . $e->getMessage());
        }

        // 2. Fallback to built-in pedagogical coach adapter (matching challenge curated hints or rule-based guidance)
        return $this->getPedagogicalFallback($challenge, $hintLevel, $code, $errorContext, $submission);
    }

    /**
     * Deterministic educational fallback ensuring learner is never blocked.
     */
    protected function getPedagogicalFallback(
        Challenge $challenge,
        string $hintLevel,
        string $code,
        ?string $errorContext,
        ?Submission $submission
    ): array {
        // Check if pre-configured progressive hints exist in challenge seed data
        $curatedHints = collect($challenge->hints ?? [])->keyBy('level');

        if ($curatedHints->has($hintLevel)) {
            $curated = $curatedHints->get($hintLevel);
            return [
                'summary' => $curated['title'] ?? ucfirst(str_replace('_', ' ', $hintLevel)),
                'likely_issue' => $errorContext ? "Observed: {$errorContext}" : "Algorithmic edge case or complexity mismatch.",
                'hint_level' => $hintLevel,
                'explanation' => $curated['content'],
                'next_steps' => [
                    "Inspect line-by-line input processing.",
                    "Verify constraint boundary values (e.g., negative numbers, empty arrays).",
                    "Add intermediate print/console statements on standard error."
                ],
                'concept_tags' => $challenge->topics ?? ['algorithms'],
                'confidence' => 0.95,
                'model_used' => 'bugquest-pedagogical-engine-v1',
            ];
        }

        // Dynamic rule-based feedback
        $levels = [
            'nudge' => [
                'summary' => 'Examine input and boundary assumptions',
                'explanation' => 'Consider how your solution behaves with minimum input size or unusual value ranges. Does it handle empty collections or single items?',
                'next_steps' => ['Write a quick test with the smallest possible input.'],
            ],
            'direction' => [
                'summary' => 'Focus on data structure access and time complexity',
                'explanation' => 'Look at the data structure you are using for lookups. Can you reduce redundant loop iterations with a Map or Set?',
                'next_steps' => ['Identify any nested loops in your implementation.'],
            ],
            'debugging_guidance' => [
                'summary' => 'Trace intermediate variables',
                'explanation' => 'Check whether your loop indices accurately cover the entire input and whether variables are updated in the correct order before return.',
                'next_steps' => ['Log the loop accumulator at each step.'],
            ],
            'detailed_explanation' => [
                'summary' => 'Detailed conceptual solution walkthrough',
                'explanation' => $challenge->editorial ?? 'Review the optimal algorithmic pattern for this challenge in the Editorial tab.',
                'next_steps' => ['Compare your approach against the optimal time complexity.'],
            ]
        ];

        $selected = $levels[$hintLevel] ?? $levels['nudge'];

        return [
            'summary' => $selected['summary'],
            'likely_issue' => $errorContext ?: 'Logic or boundary condition discrepancy.',
            'hint_level' => $hintLevel,
            'explanation' => $selected['explanation'],
            'next_steps' => $selected['next_steps'],
            'concept_tags' => $challenge->topics ?? ['problem_solving'],
            'confidence' => 0.88,
            'model_used' => 'bugquest-rule-engine-v1',
        ];
    }
}
