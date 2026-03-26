<?php

use App\Models\User;

test('guests are redirected to login when visiting teachers page', function () {
    $response = $this->get('/teachers');

    $response->assertRedirect(route('login'));
});

test('admin can view teachers table with first and last name data', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->teacher()->create([
        'name' => 'Juan Dela Cruz',
        'email' => 'juan.teacher@example.com',
    ]);

    $response = $this->actingAs($admin)->get('/teachers');

    $response->assertOk();
    $response->assertSee('Juan', false);
    $response->assertSee('Dela Cruz', false);
});

test('admin can filter teachers by first name', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->teacher()->create([
        'name' => 'Juan Dela Cruz',
        'email' => 'juan.filter@example.com',
    ]);
    User::factory()->teacher()->create([
        'name' => 'Pedro Santos',
        'email' => 'pedro.filter@example.com',
    ]);

    $response = $this->actingAs($admin)->get('/teachers?first_name=juan');

    $response->assertOk();
    $response->assertSee('Juan', false);
    $response->assertDontSee('Pedro', false);
});
