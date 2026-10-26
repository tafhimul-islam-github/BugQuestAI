<?php

namespace App\Services;

use App\Models\Challenge;
use App\Models\Recommendation;
use App\Models\SkillEvidence;
use App\Models\Submission;
use App\Models\User;

class SkillIntelligenceService
{
    /**
     * Update skill evidence based on verified assessment results.
     */
    public function recordSubmissionOutcome(Submission $submission): void
    {
        $user = $submission->user;
        $challenge = $submission->challenge;
        $topics = $challenge->topics ?? ['algorithms'];
        $isPassed = ($submission->status === 'accepted');

        foreach ($topics as $topic) {
            $evidence = SkillEvidence::firstOrNew([
                'user_id' => $user->id,
                'topic' => $topic,
            ]);

            $evidence->total_submissions += 1;
            $evidence->challenges_attempted = max($evidence->challenges_attempted, 1);

            if ($isPassed) {
                // If learner passed this challenge
                $alreadyPassed = Submission::where('user_id', $user->id)
                    ->where('challenge_id', $challenge->id)
                    ->where('status', 'accepted')
                    ->where('id', '!=', $submission->id)
                    ->exists();

                if (!$alreadyPassed) {
                    $evidence->challenges_passed += 1;
                }

                $evidence->consecutive_passes += 1;
                // Add points proportionally: +15 for beginner, +25 for intermediate, +35 for advanced
                $weight = match ($challenge->difficulty) {
                    'advanced' => 35,
                    'intermediate' => 25,
                    default => 15,
                };

                $evidence->score = min(100, $evidence->score + $weight);
            } else {
                $evidence->consecutive_passes = 0;
                // Minor deduction for repeated non-passing, bounded
                $evidence->score = max(10, $evidence->score - 5);
            }

            // Assign explainable proficiency level based on evidence
            if ($evidence->score >= 80 && $evidence->challenges_passed >= 2) {
                $evidence->proficiency_level = 'consistent';
            } elseif ($evidence->score >= 45 && $evidence->challenges_passed >= 1) {
                $evidence->proficiency_level = 'demonstrating_progress';
            } else {
                $evidence->proficiency_level = 'developing';
            }

            // Append to diagnostic history (keep last 10)
            $history = $evidence->diagnostic_history ?? [];
            $history[] = [
                'date' => now()->toDateString(),
                'challenge_slug' => $challenge->slug,
                'result' => $submission->status,
                'pass_ratio' => "{$submission->pass_count}/{$submission->total_count}",
                'time_ms' => $submission->execution_time_ms,
            ];
            if (count($history) > 10) {
                $history = array_slice($history, -10);
            }

            $evidence->diagnostic_history = $history;
            $evidence->last_assessed_at = now();
            $evidence->save();

            // Refresh recommendations for this learner
            $this->updateRecommendations($user, $topic, $isPassed, $challenge);
        }
    }

    /**
     * Deterministic recommendation engine based on observed weakness.
     */
    public function updateRecommendations(User $user, string $topic, bool $isPassed, Challenge $currentChallenge): void
    {
        if (!$isPassed) {
            // Recommend repeating or focusing on concepts
            Recommendation::updateOrCreate(
                ['user_id' => $user->id, 'challenge_id' => $currentChallenge->id],
                [
                    'reason' => "You encountered edge case difficulties in {$currentChallenge->title}. Reviewing boundary conditions and error diagnostics will strengthen your {$topic} foundation.",
                    'topic' => $topic,
                    'status' => 'pending',
                ]
            );
        } else {
            // Mark current challenge recommendation completed
            Recommendation::where('user_id', $user->id)
                ->where('challenge_id', $currentChallenge->id)
                ->update(['status' => 'completed']);

            // Find next challenge in this topic or adjacent topic that user has not passed
            $passedChallengeIds = Submission::where('user_id', $user->id)
                ->where('status', 'accepted')
                ->pluck('challenge_id');

            $nextChallenge = Challenge::where('is_active', true)
                ->whereNotIn('id', $passedChallengeIds)
                ->where(function ($query) use ($topic) {
                    $query->whereJsonContains('topics', $topic);
                })
                ->orderBy('order_index')
                ->first();

            if ($nextChallenge) {
                Recommendation::updateOrCreate(
                    ['user_id' => $user->id, 'challenge_id' => $nextChallenge->id],
                    [
                        'reason' => "Great job solving {$currentChallenge->title}! Advance your {$topic} proficiency with {$nextChallenge->title}.",
                        'topic' => $topic,
                        'status' => 'pending',
                    ]
                );
            }
        }
    }
}
