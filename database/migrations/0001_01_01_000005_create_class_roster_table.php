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
        Schema::create('class_roster', function (Blueprint $table) {
            $table->id();
            $table->foreignId('co_id')->constrained('course_offerings')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('grade_id')->nullable()->default(11)->constrained('grading_system')->onDelete('set null');
            $table->foreignId('encoded_by')->constrained('users')->onDelete('restrict');
            $table->dateTime('date_encoded')->nullable()->useCurrent();
            $table->timestamp('date_updated')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_roster');
    }
};
