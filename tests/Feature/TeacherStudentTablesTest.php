<?php

use Illuminate\Support\Facades\Schema;

test('teachers and students tables exist', function () {
    expect(Schema::hasTable('teachers'))->toBeTrue();
    expect(Schema::hasTable('students'))->toBeTrue();

    expect(Schema::hasColumns('teachers', ['user_id', 'first_name', 'last_name', 'birthday']))->toBeTrue();
    expect(Schema::hasColumns('students', ['user_id', 'first_name', 'last_name', 'birthday']))->toBeTrue();
});
