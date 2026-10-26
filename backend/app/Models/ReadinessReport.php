<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReadinessReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'report_uuid',
        'title',
        'overall_readiness_score',
        'readiness_level',
        'summary',
        'methodology_notes',
        'limitations_disclaimer',
        'included_metrics',
        'skill_breakdown',
        'verified_evidence_count',
        'generated_at',
    ];

    protected $casts = [
        'overall_readiness_score' => 'integer',
        'verified_evidence_count' => 'integer',
        'included_metrics' => 'array',
        'skill_breakdown' => 'array',
        'generated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shareTokens(): HasMany
    {
        return $this->hasMany(ReportShareToken::class);
    }
}
