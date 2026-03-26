<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GradingSystemSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $now = now();

        DB::table('grading_system')->upsert([
            ['id' => 1, 'letter_grade' => 'A', 'points' => 4.00, 'date_encoded' => $now, 'date_updated' => $now],
            ['id' => 2, 'letter_grade' => 'A-', 'points' => 3.75, 'date_encoded' => $now, 'date_updated' => $now],
            ['id' => 3, 'letter_grade' => 'B+', 'points' => 3.50, 'date_encoded' => $now, 'date_updated' => $now],
            ['id' => 4, 'letter_grade' => 'B', 'points' => 3.25, 'date_encoded' => $now, 'date_updated' => $now],
            ['id' => 5, 'letter_grade' => 'B-', 'points' => 3.00, 'date_encoded' => $now, 'date_updated' => $now],
            ['id' => 6, 'letter_grade' => 'C+', 'points' => 2.75, 'date_encoded' => $now, 'date_updated' => $now],
            ['id' => 7, 'letter_grade' => 'C', 'points' => 2.50, 'date_encoded' => $now, 'date_updated' => $now],
            ['id' => 8, 'letter_grade' => 'C-', 'points' => 2.25, 'date_encoded' => $now, 'date_updated' => $now],
            ['id' => 9, 'letter_grade' => 'D', 'points' => 2.00, 'date_encoded' => $now, 'date_updated' => $now],
            ['id' => 10, 'letter_grade' => 'F', 'points' => 0.00, 'date_encoded' => $now, 'date_updated' => $now],
            ['id' => 11, 'letter_grade' => 'Enrolled', 'points' => 1.00, 'date_encoded' => $now, 'date_updated' => $now],
            ['id' => 12, 'letter_grade' => 'Inc', 'points' => -2.00, 'date_encoded' => $now, 'date_updated' => $now],
            ['id' => 13, 'letter_grade' => 'Dropped', 'points' => -3.00, 'date_encoded' => $now, 'date_updated' => $now],
            ['id' => 14, 'letter_grade' => 'Exempted', 'points' => -4.00, 'date_encoded' => $now, 'date_updated' => $now],
        ], ['id'], ['letter_grade', 'points', 'date_encoded', 'date_updated']);
    }
}
