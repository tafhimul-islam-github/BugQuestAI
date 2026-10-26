<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SkillEvidence extends Model
{
    use HasFactory;

    protected $table = 'skill_evidence';

    protected $fillable = [
        'user_id',
        'topic',
        'proficiency_level',
        'score',
        'challenges_attempted',
        'challenges_passed',
        'total_submissions',
        'consecutive_passes',
        'hints_requested_count',
        'diagnostic_history',
        'last_assessed_at',
    ];

    protected $casts = [
        'score' => 'integer',
        'challenges_attempted' => 'integer',
        'challenges_passed' => 'integer',
        'total_submissions' => 'integer',
        'consecutive_passes' => 'integer',
        'hints_requested_count' => 'integer',
        'diagnostic_history' => 'array',
        'last_assessed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
