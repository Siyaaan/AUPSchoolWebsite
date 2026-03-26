<?php

use App\Enums\UserRole;
use App\Models\User;

test('admin can view add teacher form', function () {
    $admin = User::factory()->admin()->create();

    $response = $this
        ->actingAs($admin)
        ->get(route('teachers.create'));

    $response->assertOk();
});

test('admin can add a teacher', function () {
    $admin = User::factory()->admin()->create();

    $response = $this
        ->actingAs($admin)
        ->post(route('teachers.store'), [
            'name' => 'New Teacher',
            'email' => 'new.teacher@example.com',
            'password' => 'password123',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('teachers.index'));

    $this->assertDatabaseHas('users', [
        'name' => 'New Teacher',
        'email' => 'new.teacher@example.com',
        'role' => UserRole::Teacher->value,
    ]);
});

test('teacher cannot add another teacher', function () {
    $teacher = User::factory()->teacher()->create();

    $this
        ->actingAs($teacher)
        ->get(route('teachers.create'))
        ->assertForbidden();

    $this
        ->actingAs($teacher)
        ->post(route('teachers.store'), [
            'name' => 'Blocked Teacher',
            'email' => 'blocked.teacher@example.com',
            'password' => 'password123',
        ])
        ->assertForbidden();
});
