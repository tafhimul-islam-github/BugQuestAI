<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChallengePostMortem extends Model
{
    use HasFactory;

    protected $table = 'challenge_post_mortems';

    protected $fillable = [
        'user_id',
        'challenge_id',
        'submission_id',
        'root_cause_analysis',
        'preventative_measures',
        'score',
        'feedback',
        'ai_evaluation',
    ];

    protected $casts = [
        'score' => 'integer',
        'feedback' => 'array',
        'ai_evaluation' => 'array',
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
