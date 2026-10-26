<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('challenges', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('difficulty')->default('beginner'); // beginner, intermediate, advanced
            $table->text('description');
            $table->text('input_spec')->nullable();
            $table->text('output_spec')->nullable();
            $table->json('constraints')->nullable();
            $table->json('public_examples')->nullable();
            $table->json('starter_code')->nullable();
            $table->json('supported_languages')->nullable();
            $table->json('topics')->nullable();
            $table->json('hints')->nullable();
            $table->text('editorial')->nullable();
            $table->unsignedInteger('time_limit_ms')->default(2000);
            $table->unsignedInteger('memory_limit_mb')->default(128);
            $table->integer('order_index')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['difficulty', 'is_active']);
            $table->index('order_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('challenges');
    }
};
