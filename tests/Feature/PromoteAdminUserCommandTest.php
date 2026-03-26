<?php

use App\Enums\UserRole;
use App\Models\User;

test('users promote admin command promotes a user to admin', function () {
    $user = User::factory()->student()->create([
        'email' => 'to-promote@example.com',
        'email_verified_at' => null,
    ]);

    $this->artisan('users:promote-admin', ['email' => $user->email])
        ->expectsOutput('to-promote@example.com is now an admin.')
        ->assertSuccessful();

    $user->refresh();

    expect($user->role)->toBe(UserRole::Admin);
    expect($user->email_verified_at)->not()->toBeNull();
});

test('users promote admin command fails for unknown email', function () {
    $this->artisan('users:promote-admin', ['email' => 'missing@example.com'])
        ->expectsOutput("User with email 'missing@example.com' was not found.")
        ->assertFailed();
});
