<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChallengeFeedback extends Model
{
    protected $table = 'challenge_feedback';

    protected $fillable = [
        'challenge_id',
        'reporter_id',
        'assigned_educator_id',
        'category',
        'severity',
        'title',
        'description',
        'status',
        'resolution_note',
        'linked_challenge_version',
        'resolved_by',
        'resolved_at',
    ];

    protected $casts = [
        'linked_challenge_version' => 'integer',
        'resolved_at' => 'datetime',
    ];

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(Challenge::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function assignedEducator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_educator_id');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
