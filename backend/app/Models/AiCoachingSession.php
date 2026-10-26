<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiCoachingSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'challenge_id',
        'submission_id',
        'hint_level',
        'code_snippet',
        'error_context',
        'summary',
        'likely_issue',
        'explanation',
        'next_steps',
        'concept_tags',
        'confidence',
        'model_used',
        'tokens_used',
    ];

    protected $casts = [
        'next_steps' => 'array',
        'concept_tags' => 'array',
        'confidence' => 'float',
        'tokens_used' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(Challenge::class);
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }
}
