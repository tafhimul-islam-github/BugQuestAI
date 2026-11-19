<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChallengeVersion extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'challenge_id',
        'version_number',
        'editor_id',
        'change_summary',
        'snapshot',
        'created_at',
    ];

    protected $casts = [
        'snapshot' => 'array',
        'version_number' => 'integer',
        'created_at' => 'datetime',
    ];

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(Challenge::class);
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'editor_id');
    }
}
