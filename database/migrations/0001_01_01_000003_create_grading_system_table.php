<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('grading_system', function (Blueprint $table) {
            $table->id();
            $table->string('letter_grade', 20)->nullable();
            $table->decimal('points', 5, 2)->nullable();
            $table->dateTime('date_encoded')->nullable()->useCurrent();
            $table->timestamp('date_updated')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grading_system');
    }
};
