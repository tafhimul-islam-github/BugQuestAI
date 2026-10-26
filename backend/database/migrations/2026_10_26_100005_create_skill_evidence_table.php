<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skill_evidence', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('topic'); // e.g., 'arrays', 'strings', 'hash_maps', 'recursion', 'sorting'
            $table->string('proficiency_level')->default('developing'); // developing, demonstrating_progress, consistent
            $table->unsignedInteger('score')->default(0); // 0-100
            $table->unsignedInteger('challenges_attempted')->default(0);
            $table->unsignedInteger('challenges_passed')->default(0);
            $table->unsignedInteger('total_submissions')->default(0);
            $table->unsignedInteger('consecutive_passes')->default(0);
            $table->unsignedInteger('hints_requested_count')->default(0);
            $table->json('diagnostic_history')->nullable();
            $table->timestamp('last_assessed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'topic']);
            $table->index(['user_id', 'proficiency_level']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skill_evidence');
    }
};
