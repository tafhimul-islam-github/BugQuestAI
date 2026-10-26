<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportShareToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'readiness_report_id',
        'share_token',
        'is_revoked',
        'allow_code_samples',
        'allow_diagnostics',
        'views_count',
        'last_viewed_at',
        'expires_at',
    ];

    protected $casts = [
        'is_revoked' => 'boolean',
        'allow_code_samples' => 'boolean',
        'allow_diagnostics' => 'boolean',
        'views_count' => 'integer',
        'last_viewed_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(ReadinessReport::class, 'readiness_report_id');
    }

    public function isValid(): bool
    {
        if ($this->is_revoked) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }
}
