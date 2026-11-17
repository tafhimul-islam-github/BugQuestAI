<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InterviewSession extends Model
{
    use HasFactory;

    protected $table = 'interview_sessions';

    protected $fillable = [
        'session_code',
        'challenge_id',
        'interviewer_id',
        'candidate_name',
        'candidate_email',
        'status',
        'interviewer_notes',
        'evaluation_rubric',
    ];

    protected $casts = [
        'evaluation_rubric' => 'array',
    ];

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(Challenge::class);
    }

    public function interviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'interviewer_id');
    }
}
