<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $now = now();

        $users = DB::table('users')
            ->select('id', 'name', 'role', ...(Schema::hasColumn('users', 'birthday') ? ['birthday'] : []))
            ->whereIn('role', ['teacher', 'student'])
            ->get();

        $teachers = [];
        $students = [];

        foreach ($users as $user) {
            $nameParts = preg_split('/\s+/', trim((string) $user->name)) ?: [];
            $firstName = $nameParts[0] ?? '';
            $lastName = count($nameParts) > 1
                ? trim(implode(' ', array_slice($nameParts, 1)))
                : '';

            $payload = [
                'user_id' => $user->id,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'birthday' => $user->birthday ?? null,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if ($user->role === 'teacher') {
                $teachers[] = $payload;
            }

            if ($user->role === 'student') {
                $students[] = $payload;
            }
        }

        if ($teachers !== []) {
            DB::table('teachers')->insertOrIgnore($teachers);
        }

        if ($students !== []) {
            DB::table('students')->insertOrIgnore($students);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('teachers')->truncate();
        DB::table('students')->truncate();
    }
};
