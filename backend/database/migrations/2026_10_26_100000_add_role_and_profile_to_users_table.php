<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('learner')->after('email'); // learner, educator, admin
            $table->string('target_role')->nullable()->after('role'); // e.g., 'Full-Stack Developer', 'Junior Backend Engineer'
            $table->text('bio')->nullable()->after('target_role');
            $table->json('settings')->nullable()->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'target_role', 'bio', 'settings']);
        });
    }
};
