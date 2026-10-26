<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('readiness_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->uuid('report_uuid')->unique();
            $table->string('title');
            $table->unsignedInteger('overall_readiness_score')->default(0);
            $table->string('readiness_level')->default('Developing Proficiency');
            $table->text('summary');
            $table->text('methodology_notes');
            $table->text('limitations_disclaimer');
            $table->json('included_metrics');
            $table->json('skill_breakdown');
            $table->unsignedInteger('verified_evidence_count')->default(0);
            $table->timestamp('generated_at')->useCurrent();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });

        Schema::create('report_share_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('readiness_report_id')->constrained('readiness_reports')->cascadeOnDelete();
            $table->string('share_token', 64)->unique();
            $table->boolean('is_revoked')->default(false);
            $table->boolean('allow_code_samples')->default(false);
            $table->boolean('allow_diagnostics')->default(true);
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamp('last_viewed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['share_token', 'is_revoked']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_share_tokens');
        Schema::dropIfExists('readiness_reports');
    }
};
