<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CourseOffering>
 */
class CourseOfferingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'subject_id' => \App\Models\Subject::factory(),
            'teacher_id' => \App\Models\User::factory(['role' => 'teacher']),
            'day' => $this->faker->dayOfWeek(),
            'room' => $this->faker->bothify('####'),
            'start_time' => $this->faker->time('H:i'),
            'end_time' => $this->faker->time('H:i'),
            'year' => $this->faker->year(),
            'sem' => $this->faker->randomElement(['1ST', '2ND']),
            'date_encoded' => now(),
        ];
    }
}
