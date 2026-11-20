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
            Log::info("FastAPI service unreachable, checking direct provider keys: " . $e->getMessage());
        }

        // 2. Direct Google Gemini API call (works in Laragon without running Python FastAPI server)
        $geminiKey = (string) env('GEMINI_API_KEY', '');
        if ($geminiKey !== '') {
            $geminiHint = $this->callGeminiDirectly($geminiKey, $payload);
            if ($geminiHint !== null) {
                return $geminiHint;
            }
        }

        // 3. Fallback to built-in pedagogical coach adapter (matching challenge curated hints or rule-based guidance)
        return $this->getPedagogicalFallback($challenge, $hintLevel, $code, $errorContext, $submission);
    }

    /**
     * Check whether an external AI provider key is configured directly in Laravel or the FastAPI service is online.
     */
    public static function isOperational(): bool
    {
        if (!empty(env('GEMINI_API_KEY')) || !empty(env('OPENROUTER_API_KEY')) || !empty(env('OPENAI_API_KEY'))) {
            return true;
        }

        try {
            $res = Http::timeout(2)->get(env('AI_SERVICE_URL', 'http://127.0.0.1:8001') . '/health');
            return $res->successful();
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Call Google AI Studio Gemini API directly via X-goog-api-key header.
     */
    protected function callGeminiDirectly(string $apiKey, array $payload): ?array
    {
        $model = env('GEMINI_MODEL', 'gemini-flash-latest');
        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

        $systemInstruction = "You are BugQuest AI's Socratic debugging coach. Never reveal the full solution code directly. "
            . "Provide progressive debugging guidance for level '{$payload['hint_level']}'. "
            . "Respond ONLY with valid JSON containing keys: "
            . "\"summary\" (string), \"likely_issue\" (string), \"explanation\" (string), "
            . "\"next_steps\" (array of strings), \"concept_tags\" (array of strings), \"confidence\" (number 0-1).";

        $userPrompt = "Challenge: {$payload['challenge_title']}\n"
            . "Description: {$payload['challenge_description']}\n"
            . "Language: {$payload['language']}\n"
            . "Hint Level: {$payload['hint_level']}\n"
            . "Error Context: " . ($payload['error_context'] ?? 'None') . "\n"
            . "Learner Code:\n{$payload['code']}";

        try {
            $response = Http::timeout(12)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-goog-api-key' => $apiKey,
                ])
                ->post($endpoint, [
                    'systemInstruction' => [
                        'parts' => [
                            ['text' => $systemInstruction],
                        ],
                    ],
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $userPrompt],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'responseMimeType' => 'application/json',
                        'temperature' => 0.2,
                    ],
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $rawText = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                if (is_string($rawText)) {
                    $parsed = json_decode($rawText, true);
                    if (is_array($parsed) && !empty($parsed['summary']) && !empty($parsed['explanation'])) {
                        return [
                            'summary' => $parsed['summary'],
                            'likely_issue' => $parsed['likely_issue'] ?? ($payload['error_context'] ?: 'Logic or boundary condition discrepancy.'),
                            'hint_level' => $payload['hint_level'],
                            'explanation' => $parsed['explanation'],
                            'next_steps' => is_array($parsed['next_steps'] ?? null) ? $parsed['next_steps'] : ['Review the failing test case input and trace variable states.'],
                            'concept_tags' => is_array($parsed['concept_tags'] ?? null) ? $parsed['concept_tags'] : ($payload['topics'] ?: ['debugging']),
                            'confidence' => (float) ($parsed['confidence'] ?? 0.92),
                            'model_used' => $model,
                        ];
                    }
                }
            } else {
                Log::warning('Gemini API returned non-200 status: ' . $response->status() . ' ' . $response->body());
            }
        } catch (\Throwable $e) {
            Log::warning('Direct Gemini API request failed, using pedagogical fallback: ' . $e->getMessage());
        }

        return null;
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
