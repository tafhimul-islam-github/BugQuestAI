<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('challenges', function (Blueprint $table) {
            $table->string('category')->nullable()->after('difficulty');
            $table->string('framework')->nullable()->after('category');
            $table->unsignedInteger('investigation_time_minutes')->default(25)->after('framework');
            $table->json('bug_report')->nullable()->after('description');
            $table->json('repository_files')->nullable()->after('bug_report');
            $table->json('reference_patch')->nullable()->after('repository_files');
            $table->string('entrypoint_test')->nullable()->after('reference_patch');
            $table->index('category');
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->json('modified_files')->nullable()->after('code');
            $table->text('patch_diff')->nullable()->after('modified_files');
            $table->json('hypothesis')->nullable()->after('patch_diff');
            $table->json('evidence_records')->nullable()->after('hypothesis');
        });
    }

    public function down(): void
    {
        Schema::table('challenges', function (Blueprint $table) {
            $table->dropIndex(['category']);
            $table->dropColumn([
                'category',
                'framework',
                'investigation_time_minutes',
                'bug_report',
                'repository_files',
                'reference_patch',
                'entrypoint_test',
            ]);
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn([
                'modified_files',
                'patch_diff',
                'hypothesis',
                'evidence_records',
            ]);
        });
    }
};
