<?php

use App\Enums\UserRole;
use App\Models\User;

it('student can access my courses page', function () {
    $student = User::factory()->create(['role' => UserRole::Student]);

    $response = $this->actingAs($student)->get('/my-courses');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Students/MyCourses')
        ->has('courses')
    );
});

it('student can access my grades page', function () {
    $student = User::factory()->create(['role' => UserRole::Student]);

    $response = $this->actingAs($student)->get('/my-grades');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Grades/MyGrades')
        ->has('grades')
    );
});

it('non-student cannot access my courses page', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $response = $this->actingAs($admin)->get('/my-courses');

    $response->assertForbidden();
});

it('non-student cannot access my grades page', function () {
    $teacher = User::factory()->create(['role' => UserRole::Teacher]);

    $response = $this->actingAs($teacher)->get('/my-grades');

    $response->assertForbidden();
});

it('unauthenticated user cannot access my courses page', function () {
    $response = $this->get('/my-courses');

    $response->assertRedirect('/login');
});

it('unauthenticated user cannot access my grades page', function () {
    $response = $this->get('/my-grades');

    $response->assertRedirect('/login');
});
