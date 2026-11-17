<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'challenge_id',
        'language',
        'code',
        'modified_files',
        'patch_diff',
        'hypothesis',
        'evidence_records',
        'status',
        'pass_count',
        'total_count',
        'execution_time_ms',
        'memory_kb',
        'error_output',
        'public_test_results',
        'judge_provider',
        'idempotency_key',
        'telemetry',
        'chaos_results',
    ];

    protected $casts = [
        'modified_files' => 'array',
        'hypothesis' => 'array',
        'evidence_records' => 'array',
        'public_test_results' => 'array',
        'telemetry' => 'array',
        'chaos_results' => 'array',
        'pass_count' => 'integer',
        'total_count' => 'integer',
        'execution_time_ms' => 'float',
        'memory_kb' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(Challenge::class);
    }

    public function coachingSessions(): HasMany
    {
        return $this->hasMany(AiCoachingSession::class);
    }
}
