<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChallengeTestCase extends Model
{
    use HasFactory;

    protected $fillable = [
        'challenge_id',
        'input',
        'expected_output',
        'is_hidden',
        'explanation',
        'order_index',
    ];

    protected $casts = [
        'is_hidden' => 'boolean',
        'order_index' => 'integer',
    ];

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(Challenge::class);
    }
}
