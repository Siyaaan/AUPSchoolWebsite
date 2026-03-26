<?php

use Illuminate\Support\Facades\Schema;

test('teachers and students tables exist', function () {
    expect(Schema::hasTable('teachers'))->toBeTrue();
    expect(Schema::hasTable('students'))->toBeTrue();

    expect(Schema::hasColumns('teachers', ['user_id', 'first_name', 'last_name', 'birthday']))->toBeTrue();
    expect(Schema::hasColumns('students', ['user_id', 'first_name', 'last_name', 'birthday']))->toBeTrue();
});

test('course offerings and class roster enforce teacher and student foreign keys', function () {
    $courseOfferingsForeignKeys = collect(Schema::getForeignKeys('course_offerings'));
    $classRosterForeignKeys = collect(Schema::getForeignKeys('class_roster'));

    $teacherForeignKey = $courseOfferingsForeignKeys->first(fn (array $foreignKey): bool => $foreignKey['columns'] === ['teacher_id']);
    $studentForeignKey = $classRosterForeignKeys->first(fn (array $foreignKey): bool => $foreignKey['columns'] === ['student_id']);

    expect($teacherForeignKey)->not()->toBeNull();
    expect($teacherForeignKey['foreign_table'])->toBe('teachers');
    expect($teacherForeignKey['foreign_columns'])->toBe(['user_id']);

    expect($studentForeignKey)->not()->toBeNull();
    expect($studentForeignKey['foreign_table'])->toBe('students');
    expect($studentForeignKey['foreign_columns'])->toBe(['user_id']);
});
