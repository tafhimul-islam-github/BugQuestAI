<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Challenge extends Model
{
    use HasFactory;

    public const REVIEW_DRAFT = 'draft';
    public const REVIEW_PENDING = 'pending_review';
    public const REVIEW_CHANGES_REQUESTED = 'changes_requested';
    public const REVIEW_APPROVED = 'approved';

    public const AVAILABILITY_UNPUBLISHED = 'unpublished';
    public const AVAILABILITY_PUBLISHED = 'published';
    public const AVAILABILITY_DISABLED = 'disabled';
    public const AVAILABILITY_ARCHIVED = 'archived';

    protected $fillable = [
        'author_id',
        'slug',
        'title',
        'difficulty',
        'category',
        'framework',
        'investigation_time_minutes',
        'description',
        'bug_report',
        'repository_files',
        'reference_patch',
        'entrypoint_test',
        'input_spec',
        'output_spec',
        'constraints',
        'public_examples',
        'starter_code',
        'supported_languages',
        'topics',
        'hints',
        'telemetry_traces',
        'editorial',
        'time_limit_ms',
        'memory_limit_mb',
        'order_index',
        'is_active',
        'review_status',
        'availability_status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
        'version',
        'published_at',
        'last_validated_at',
        'last_validation_passed',
    ];

    protected $casts = [
        'bug_report' => 'array',
        'repository_files' => 'array',
        'reference_patch' => 'array',
        'constraints' => 'array',
        'public_examples' => 'array',
        'starter_code' => 'array',
        'supported_languages' => 'array',
        'topics' => 'array',
        'hints' => 'array',
        'telemetry_traces' => 'array',
        'is_active' => 'boolean',
        'last_validation_passed' => 'boolean',
        'investigation_time_minutes' => 'integer',
        'time_limit_ms' => 'integer',
        'memory_limit_mb' => 'integer',
        'order_index' => 'integer',
        'version' => 'integer',
        'reviewed_at' => 'datetime',
        'published_at' => 'datetime',
        'last_validated_at' => 'datetime',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(ChallengeVersion::class)->orderByDesc('version_number');
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(ChallengeFeedback::class)->orderByDesc('created_at');
    }

    public function snapshotPayload(): array
    {
        return [
            'title' => $this->title,
            'difficulty' => $this->difficulty,
            'category' => $this->category,
            'framework' => $this->framework,
            'investigation_time_minutes' => $this->investigation_time_minutes,
            'description' => $this->description,
            'bug_report' => $this->bug_report,
            'starter_code' => $this->starter_code,
            'supported_languages' => $this->supported_languages,
            'topics' => $this->topics,
            'hints' => $this->hints,
            'editorial' => $this->editorial,
            'entrypoint_test' => $this->entrypoint_test,
        ];
    }

    public function testCases(): HasMany
    {
        return $this->hasMany(ChallengeTestCase::class);
    }

    public function publicTestCases(): HasMany
    {
        return $this->hasMany(ChallengeTestCase::class)->where('is_hidden', false)->orderBy('order_index');
    }

    public function hiddenTestCases(): HasMany
    {
        return $this->hasMany(ChallengeTestCase::class)->where('is_hidden', true)->orderBy('order_index');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    public function coachingSessions(): HasMany
    {
        return $this->hasMany(AiCoachingSession::class);
    }
}
