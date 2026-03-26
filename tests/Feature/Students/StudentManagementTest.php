<?php

use App\Enums\UserRole;
use App\Models\User;

test('admin can view add student form', function () {
    $admin = User::factory()->admin()->create();

    $response = $this
        ->actingAs($admin)
        ->get(route('students.create'));

    $response->assertOk();
});

test('admin can add a student', function () {
    $admin = User::factory()->admin()->create();

    $response = $this
        ->actingAs($admin)
        ->post(route('students.store'), [
            'name' => 'New Student',
            'email' => 'new.student@example.com',
            'password' => 'password123',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('students.index'));

    $this->assertDatabaseHas('users', [
        'name' => 'New Student',
        'email' => 'new.student@example.com',
        'role' => UserRole::Student->value,
    ]);
});

test('teacher cannot add a student', function () {
    $teacher = User::factory()->teacher()->create();

    $this
        ->actingAs($teacher)
        ->get(route('students.create'))
        ->assertForbidden();

    $this
        ->actingAs($teacher)
        ->post(route('students.store'), [
            'name' => 'Blocked Student',
            'email' => 'blocked.student@example.com',
            'password' => 'password123',
        ])
        ->assertForbidden();
});
