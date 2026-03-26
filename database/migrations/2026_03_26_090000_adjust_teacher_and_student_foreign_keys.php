<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('course_offerings')
            ->whereNotNull('teacher_id')
            ->whereNotIn('teacher_id', DB::table('teachers')->select('user_id'))
            ->update(['teacher_id' => null]);

        DB::table('class_roster')
            ->whereNotIn('student_id', DB::table('students')->select('user_id'))
            ->delete();

        Schema::table('course_offerings', function (Blueprint $table) {
            $table->dropForeign(['teacher_id']);
            $table->foreign('teacher_id')->references('user_id')->on('teachers')->nullOnDelete();
        });

        Schema::table('class_roster', function (Blueprint $table) {
            $table->dropForeign(['student_id']);
            $table->foreign('student_id')->references('user_id')->on('students')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_offerings', function (Blueprint $table) {
            $table->dropForeign(['teacher_id']);
            $table->foreign('teacher_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('class_roster', function (Blueprint $table) {
            $table->dropForeign(['student_id']);
            $table->foreign('student_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
