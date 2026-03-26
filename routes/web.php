<?php

use App\Http\Controllers\ClassRosterController;
use App\Http\Controllers\CourseOfferingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GradesController;
use App\Http\Controllers\PeopleController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TeachingLoadController;
use App\Http\Controllers\UsersController;
use App\Models\ClassRoster;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

// Route model bindings
Route::bind('classroster', fn ($id) => ClassRoster::with('courseOffering')->findOrFail($id));

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Student routes
    Route::get('my-courses', [StudentController::class, 'myCourses'])->name('my-courses');
    Route::get('my-grades', [StudentController::class, 'myGrades'])->name('my-grades');

    Route::resource('people', PeopleController::class);
    Route::resource('users', UsersController::class)->only(['index', 'store', 'update']);
    Route::resource('course-offerings', CourseOfferingController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::post('course-offerings/{courseOffering}/register', [CourseOfferingController::class, 'register'])->name('course-offerings.register');
    Route::resource('classroster', ClassRosterController::class)->only(['index', 'update']);
    Route::resource('teachers', TeacherController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    Route::get('grades', GradesController::class)->name('grades.index');
    Route::put('grades/classroster/{classRoster}', [GradesController::class, 'update'])->name('grades.classroster.update');
    Route::resource('students', StudentController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    Route::get('teaching-load', TeachingLoadController::class)->name('teaching-load.index');
});

require __DIR__.'/settings.php';
