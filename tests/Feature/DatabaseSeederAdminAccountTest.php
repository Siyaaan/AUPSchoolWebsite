<?php

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Hash;

test('database seeder enforces admin account role and credentials', function () {
    User::query()->create([
        'name' => 'Wrong Admin',
        'email' => 'admin@example.com',
        'password' => Hash::make('password'),
        'role' => UserRole::Student,
        'email_verified_at' => null,
    ]);

    $this->seed(DatabaseSeeder::class);

    $admin = User::query()->where('email', 'admin@example.com')->firstOrFail();

    expect($admin->role)->toBe(UserRole::Admin);
    expect($admin->email_verified_at)->not()->toBeNull();
    expect(Hash::check('password', $admin->password))->toBeTrue();
});
