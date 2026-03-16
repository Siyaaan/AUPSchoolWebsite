<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);

        User::factory()->teacher()->create([
            'name' => 'Teacher User',
            'email' => 'teacher@example.com',
        ]);

        User::factory()->student()->create([
            'name' => 'Student User',
            'email' => 'student@example.com',
        ]);
    }
}
