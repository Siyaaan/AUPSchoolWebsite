<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ClassRoster>
 */
class ClassRosterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'co_id' => \App\Models\CourseOffering::factory(),
            'student_id' => \App\Models\User::factory(['role' => 'student']),
            'date_encoded' => now(),
        ];
    }
}
