<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            if (!Schema::hasColumn('submissions', 'telemetry')) {
                $table->json('telemetry')->nullable()->after('evidence_records');
            }
            if (!Schema::hasColumn('submissions', 'chaos_results')) {
                $table->json('chaos_results')->nullable()->after('telemetry');
            }
        });

        Schema::table('challenges', function (Blueprint $table) {
            if (!Schema::hasColumn('challenges', 'telemetry_traces')) {
                $table->json('telemetry_traces')->nullable()->after('hints');
            }
        });

        if (!Schema::hasTable('challenge_post_mortems')) {
            Schema::create('challenge_post_mortems', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('challenge_id')->constrained()->cascadeOnDelete();
                $table->foreignId('submission_id')->constrained()->cascadeOnDelete();
                $table->text('root_cause_analysis');
                $table->text('preventative_measures');
                $table->unsignedInteger('score')->default(0);
                $table->json('feedback')->nullable();
                $table->json('ai_evaluation')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('challenge_post_mortems');

        Schema::table('challenges', function (Blueprint $table) {
            if (Schema::hasColumn('challenges', 'telemetry_traces')) {
                $table->dropColumn('telemetry_traces');
            }
        });

        Schema::table('submissions', function (Blueprint $table) {
            if (Schema::hasColumn('submissions', 'chaos_results')) {
                $table->dropColumn('chaos_results');
            }
            if (Schema::hasColumn('submissions', 'telemetry')) {
                $table->dropColumn('telemetry');
            }
        });
    }
};
