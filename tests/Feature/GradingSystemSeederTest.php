<?php

use Database\Seeders\GradingSystemSeeder;
use Illuminate\Support\Facades\DB;

test('grading system seeder inserts the expected grade scale', function () {
    $this->seed(GradingSystemSeeder::class);

    expect(DB::table('grading_system')->count())->toBe(14);

    expect(DB::table('grading_system')->where('id', 1)->value('letter_grade'))->toBe('A');
    expect((float) DB::table('grading_system')->where('id', 1)->value('points'))->toBe(4.00);

    expect(DB::table('grading_system')->where('id', 11)->value('letter_grade'))->toBe('Enrolled');
    expect((float) DB::table('grading_system')->where('id', 11)->value('points'))->toBe(1.00);

    expect(DB::table('grading_system')->where('id', 14)->value('letter_grade'))->toBe('Exempted');
    expect((float) DB::table('grading_system')->where('id', 14)->value('points'))->toBe(-4.00);
});
