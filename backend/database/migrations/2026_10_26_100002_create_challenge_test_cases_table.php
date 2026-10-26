<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('challenge_test_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained('challenges')->cascadeOnDelete();
            $table->text('input');
            $table->text('expected_output');
            $table->boolean('is_hidden')->default(false);
            $table->text('explanation')->nullable();
            $table->integer('order_index')->default(0);
            $table->timestamps();

            $table->index(['challenge_id', 'is_hidden']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('challenge_test_cases');
    }
};
