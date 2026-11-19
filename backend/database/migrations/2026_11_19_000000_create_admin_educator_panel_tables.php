<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'status')) {
                $table->string('status', 32)->default('active')->index()->after('role');
            }
            if (!Schema::hasColumn('users', 'suspended_at')) {
                $table->timestamp('suspended_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('users', 'suspended_reason')) {
                $table->text('suspended_reason')->nullable()->after('suspended_at');
            }
            if (!Schema::hasColumn('users', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable()->after('suspended_reason');
            }
        });

        Schema::table('challenges', function (Blueprint $table) {
            if (!Schema::hasColumn('challenges', 'author_id')) {
                $table->foreignId('author_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('challenges', 'review_status')) {
                $table->string('review_status', 32)->default('draft')->index()->after('is_active');
            }
            if (!Schema::hasColumn('challenges', 'availability_status')) {
                $table->string('availability_status', 32)->default('unpublished')->index()->after('review_status');
            }
            if (!Schema::hasColumn('challenges', 'reviewed_by')) {
                $table->foreignId('reviewed_by')->nullable()->after('availability_status')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('challenges', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            }
            if (!Schema::hasColumn('challenges', 'review_notes')) {
                $table->text('review_notes')->nullable()->after('reviewed_at');
            }
            if (!Schema::hasColumn('challenges', 'version')) {
                $table->unsignedInteger('version')->default(1)->after('review_notes');
            }
            if (!Schema::hasColumn('challenges', 'published_at')) {
                $table->timestamp('published_at')->nullable()->after('version');
            }
            if (!Schema::hasColumn('challenges', 'last_validated_at')) {
                $table->timestamp('last_validated_at')->nullable()->after('published_at');
            }
            if (!Schema::hasColumn('challenges', 'last_validation_passed')) {
                $table->boolean('last_validation_passed')->nullable()->after('last_validated_at');
            }
        });

        // Backfill existing challenges so already-active challenges remain published and visible.
        DB::table('challenges')
            ->where('is_active', true)
            ->update([
                'review_status' => 'approved',
                'availability_status' => 'published',
                'published_at' => now(),
            ]);

        DB::table('challenges')
            ->where('is_active', false)
            ->update([
                'review_status' => 'draft',
                'availability_status' => 'disabled',
            ]);

        Schema::create('challenge_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained('challenges')->cascadeOnDelete();
            $table->unsignedInteger('version_number');
            $table->foreignId('editor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('change_summary', 500)->nullable();
            $table->json('snapshot');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['challenge_id', 'version_number']);
        });

        Schema::create('challenge_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained('challenges')->cascadeOnDelete();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_educator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('category', 40)->default('bug_report');
            $table->string('severity', 20)->default('medium');
            $table->string('title', 200);
            $table->text('description');
            $table->string('status', 32)->default('open')->index();
            $table->text('resolution_note')->nullable();
            $table->unsignedInteger('linked_challenge_version')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['challenge_id', 'status']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 100)->index();
            $table->string('target_type', 80)->nullable()->index();
            $table->unsignedBigInteger('target_id')->nullable();
            $table->string('summary', 500);
            $table->json('metadata')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });

        Schema::create('classrooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('educator_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('code', 32)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('classroom_learner', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('learner_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('enrolled_at')->useCurrent();

            $table->unique(['classroom_id', 'learner_id']);
        });

        Schema::create('classroom_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('challenge_id')->constrained('challenges')->cascadeOnDelete();
            $table->foreignId('assigned_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('due_at')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['classroom_id', 'challenge_id']);
        });

        Schema::create('panel_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 60)->index();
            $table->string('title', 200);
            $table->text('message');
            $table->string('link', 255)->nullable();
            $table->timestamp('read_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->json('value');
            $table->string('category', 50)->default('features')->index();
            $table->string('description', 255)->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
        Schema::dropIfExists('panel_notifications');
        Schema::dropIfExists('classroom_assignments');
        Schema::dropIfExists('classroom_learner');
        Schema::dropIfExists('classrooms');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('challenge_feedback');
        Schema::dropIfExists('challenge_versions');

        Schema::table('challenges', function (Blueprint $table) {
            $table->dropConstrainedForeignId('author_id');
            $table->dropConstrainedForeignId('reviewed_by');
            $table->dropColumn([
                'review_status',
                'availability_status',
                'reviewed_at',
                'review_notes',
                'version',
                'published_at',
                'last_validated_at',
                'last_validation_passed',
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status', 'suspended_at', 'suspended_reason', 'last_login_at']);
        });
    }
};
