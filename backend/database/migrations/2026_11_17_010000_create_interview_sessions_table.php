<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('interview_sessions')) {
            Schema::create('interview_sessions', function (Blueprint $table) {
                $table->id();
                $table->string('session_code', 32)->unique();
                $table->foreignId('challenge_id')->constrained()->cascadeOnDelete();
                $table->foreignId('interviewer_id')->constrained('users')->cascadeOnDelete();
                $table->string('candidate_name')->default('Candidate');
                $table->string('candidate_email')->nullable();
                $table->string('status', 32)->default('active');
                $table->text('interviewer_notes')->nullable();
                $table->json('evaluation_rubric')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_sessions');
    }
};
