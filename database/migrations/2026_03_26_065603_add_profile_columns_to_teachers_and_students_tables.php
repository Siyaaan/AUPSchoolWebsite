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
        if (! Schema::hasColumn('teachers', 'first_name')) {
            Schema::table('teachers', function (Blueprint $table) {
                $table->string('first_name')->nullable()->after('user_id');
            });
        }

        if (! Schema::hasColumn('teachers', 'last_name')) {
            Schema::table('teachers', function (Blueprint $table) {
                $table->string('last_name')->nullable()->after('first_name');
            });
        }

        if (! Schema::hasColumn('teachers', 'birthday')) {
            Schema::table('teachers', function (Blueprint $table) {
                $table->date('birthday')->nullable()->after('last_name');
            });
        }

        if (! Schema::hasColumn('students', 'first_name')) {
            Schema::table('students', function (Blueprint $table) {
                $table->string('first_name')->nullable()->after('user_id');
            });
        }

        if (! Schema::hasColumn('students', 'last_name')) {
            Schema::table('students', function (Blueprint $table) {
                $table->string('last_name')->nullable()->after('first_name');
            });
        }

        if (! Schema::hasColumn('students', 'birthday')) {
            Schema::table('students', function (Blueprint $table) {
                $table->date('birthday')->nullable()->after('last_name');
            });
        }

        $users = DB::table('users')
            ->select('id', 'name')
            ->get();

        foreach ($users as $user) {
            $nameParts = preg_split('/\s+/', trim((string) $user->name)) ?: [];
            $firstName = $nameParts[0] ?? '';
            $lastName = count($nameParts) > 1
                ? trim(implode(' ', array_slice($nameParts, 1)))
                : '';

            DB::table('teachers')
                ->where('user_id', $user->id)
                ->update([
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                ]);

            DB::table('students')
                ->where('user_id', $user->id)
                ->update([
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                ]);
        }

        if (Schema::hasColumn('users', 'birthday')) {
            $teacherBirthdays = DB::table('users')
                ->join('teachers', 'teachers.user_id', '=', 'users.id')
                ->whereNotNull('users.birthday')
                ->select('teachers.user_id', 'users.birthday')
                ->get();

            foreach ($teacherBirthdays as $row) {
                DB::table('teachers')
                    ->where('user_id', $row->user_id)
                    ->update(['birthday' => $row->birthday]);
            }

            $studentBirthdays = DB::table('users')
                ->join('students', 'students.user_id', '=', 'users.id')
                ->whereNotNull('users.birthday')
                ->select('students.user_id', 'users.birthday')
                ->get();

            foreach ($studentBirthdays as $row) {
                DB::table('students')
                    ->where('user_id', $row->user_id)
                    ->update(['birthday' => $row->birthday]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('teachers', 'first_name') || Schema::hasColumn('teachers', 'last_name') || Schema::hasColumn('teachers', 'birthday')) {
            Schema::table('teachers', function (Blueprint $table) {
                $columns = [];

                if (Schema::hasColumn('teachers', 'first_name')) {
                    $columns[] = 'first_name';
                }

                if (Schema::hasColumn('teachers', 'last_name')) {
                    $columns[] = 'last_name';
                }

                if (Schema::hasColumn('teachers', 'birthday')) {
                    $columns[] = 'birthday';
                }

                if ($columns !== []) {
                    $table->dropColumn($columns);
                }
            });
        }

        if (Schema::hasColumn('students', 'first_name') || Schema::hasColumn('students', 'last_name') || Schema::hasColumn('students', 'birthday')) {
            Schema::table('students', function (Blueprint $table) {
                $columns = [];

                if (Schema::hasColumn('students', 'first_name')) {
                    $columns[] = 'first_name';
                }

                if (Schema::hasColumn('students', 'last_name')) {
                    $columns[] = 'last_name';
                }

                if (Schema::hasColumn('students', 'birthday')) {
                    $columns[] = 'birthday';
                }

                if ($columns !== []) {
                    $table->dropColumn($columns);
                }
            });
        }
    }
};
