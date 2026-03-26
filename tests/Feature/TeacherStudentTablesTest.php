<?php

use Illuminate\Support\Facades\Schema;

test('teachers and students tables exist', function () {
    expect(Schema::hasTable('teachers'))->toBeTrue();
    expect(Schema::hasTable('students'))->toBeTrue();
});
