<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Challenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'title',
        'difficulty',
        'description',
        'input_spec',
        'output_spec',
        'constraints',
        'public_examples',
        'starter_code',
        'supported_languages',
        'topics',
        'hints',
        'editorial',
        'time_limit_ms',
        'memory_limit_mb',
        'order_index',
        'is_active',
    ];

    protected $casts = [
        'constraints' => 'array',
        'public_examples' => 'array',
        'starter_code' => 'array',
        'supported_languages' => 'array',
        'topics' => 'array',
        'hints' => 'array',
        'is_active' => 'boolean',
        'time_limit_ms' => 'integer',
        'memory_limit_mb' => 'integer',
        'order_index' => 'integer',
    ];

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
