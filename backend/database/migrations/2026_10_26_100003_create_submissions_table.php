<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('challenge_id')->constrained('challenges')->cascadeOnDelete();
            $table->string('language'); // javascript, python
            $table->longText('code');
            $table->string('status')->default('queued'); // queued, running, accepted, wrong_answer, compilation_error, runtime_error, time_limit_exceeded, error
            $table->unsignedInteger('pass_count')->default(0);
            $table->unsignedInteger('total_count')->default(0);
            $table->decimal('execution_time_ms', 10, 2)->nullable();
            $table->unsignedInteger('memory_kb')->nullable();
            $table->text('error_output')->nullable();
            $table->json('public_test_results')->nullable();
            $table->string('judge_provider')->default('isolated_sandbox');
            $table->string('idempotency_key')->nullable()->index();
            $table->timestamps();

            $table->index(['user_id', 'challenge_id']);
            $table->index(['challenge_id', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
