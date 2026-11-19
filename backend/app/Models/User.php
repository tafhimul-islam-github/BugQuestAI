<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'suspended_at',
        'suspended_reason',
        'last_login_at',
        'target_role',
        'bio',
        'settings',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'suspended_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'settings' => 'array',
        ];
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isEducator(): bool
    {
        return $this->role === 'educator';
    }

    public function isLearner(): bool
    {
        return $this->role === 'learner';
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    public function skillEvidence(): HasMany
    {
        return $this->hasMany(SkillEvidence::class);
    }

    public function recommendations(): HasMany
    {
        return $this->hasMany(Recommendation::class);
    }

    public function readinessReports(): HasMany
    {
        return $this->hasMany(ReadinessReport::class);
    }

    public function coachingSessions(): HasMany
    {
        return $this->hasMany(AiCoachingSession::class);
    }

    public function authoredChallenges(): HasMany
    {
        return $this->hasMany(Challenge::class, 'author_id');
    }

    public function classrooms(): HasMany
    {
        return $this->hasMany(Classroom::class, 'educator_id');
    }

    public function enrolledClassrooms(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Classroom::class, 'classroom_learner', 'learner_id', 'classroom_id')
            ->withPivot('enrolled_at');
    }

    public function panelNotifications(): HasMany
    {
        return $this->hasMany(PanelNotification::class);
    }
}
