<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Classroom extends Model
{
    protected $fillable = [
        'educator_id',
        'name',
        'code',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function educator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'educator_id');
    }

    public function learners(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'classroom_learner', 'classroom_id', 'learner_id')
            ->withPivot('enrolled_at');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(ClassroomAssignment::class);
    }
}
