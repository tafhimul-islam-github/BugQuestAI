<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('challenge_id')->constrained('challenges')->cascadeOnDelete();
            $table->text('reason');
            $table->string('topic');
            $table->string('status')->default('pending'); // pending, completed, dismissed
            $table->timestamps();

            $table->unique(['user_id', 'challenge_id']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recommendations');
    }
};
