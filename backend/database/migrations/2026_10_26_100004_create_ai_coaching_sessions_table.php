<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_coaching_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('challenge_id')->constrained('challenges')->cascadeOnDelete();
            $table->foreignId('submission_id')->nullable()->constrained('submissions')->nullOnDelete();
            $table->string('hint_level'); // nudge, direction, debugging_guidance, detailed_explanation
            $table->longText('code_snippet');
            $table->text('error_context')->nullable();
            $table->text('summary');
            $table->text('likely_issue')->nullable();
            $table->longText('explanation');
            $table->json('next_steps')->nullable();
            $table->json('concept_tags')->nullable();
            $table->decimal('confidence', 4, 2)->default(0.90);
            $table->string('model_used')->default('gemini-1.5-flash');
            $table->unsignedInteger('tokens_used')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'challenge_id']);
            $table->index('hint_level');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_coaching_sessions');
    }
};
