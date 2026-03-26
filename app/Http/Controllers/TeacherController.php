<?php

namespace App\Http\Controllers;

use App\Models\CourseOffering;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    /**
     * Display a listing of teachers with their teaching loads.
     */
    public function index(): Response
    {
        Gate::authorize('viewAny', User::class);

        $year = request('year');
        $semester = request('semester');
        $firstName = strtolower(trim((string) request('first_name', '')));
        $lastName = strtolower(trim((string) request('last_name', '')));

        $year = $year && $year !== 'all' ? $year : null;
        $semester = $semester && $semester !== 'all' ? $semester : null;

        $teachers = User::query()
            ->where('role', 'teacher')
            ->with([
                'courseOfferingsAsTeacher' => function ($query) use ($year, $semester) {
                    $query->with(['subject', 'classRoster.student']);
                    if ($year) {
                        $query->where('year', $year);
                    }
                    if ($semester) {
                        $query->where('sem', $semester);
                    }
                    $query->latest('date_encoded');
                },
            ])
            ->latest()
            ->get()
            ->map(function (User $teacher): array {
                $nameParts = preg_split('/\s+/', trim($teacher->name)) ?: [];
                $firstName = $nameParts[0] ?? '';
                $lastName = count($nameParts) > 1
                    ? trim(implode(' ', array_slice($nameParts, 1)))
                    : '';

                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'email' => $teacher->email,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'courseOfferingsAsTeacher' => $teacher->courseOfferingsAsTeacher
                        ->map(function (CourseOffering $courseOffering): array {
                            return [
                                'id' => $courseOffering->id,
                                'subject' => [
                                    'name' => $courseOffering->subject?->name,
                                    'code' => $courseOffering->subject?->code,
                                    'description' => $courseOffering->subject?->description,
                                ],
                                'day' => $courseOffering->day,
                                'room' => $courseOffering->room,
                                'start_time' => $courseOffering->start_time,
                                'end_time' => $courseOffering->end_time,
                                'year' => $courseOffering->year,
                                'sem' => $courseOffering->sem,
                                'classRoster' => $courseOffering->classRoster
                                    ->map(function ($roster): array {
                                        return [
                                            'id' => $roster->id,
                                            'student' => [
                                                'id' => $roster->student?->id,
                                                'name' => $roster->student?->name,
                                                'email' => $roster->student?->email,
                                            ],
                                            'date_encoded' => $roster->date_encoded,
                                        ];
                                    })
                                    ->values()
                                    ->all(),
                            ];
                        })
                        ->values()
                        ->all(),
                ];
            })
            ->filter(function (array $teacher) use ($firstName, $lastName): bool {
                $teacherFirstName = strtolower($teacher['first_name']);
                $teacherLastName = strtolower($teacher['last_name']);

                $matchesFirst = $firstName === '' || str_contains($teacherFirstName, $firstName);
                $matchesLast = $lastName === '' || str_contains($teacherLastName, $lastName);

                return $matchesFirst && $matchesLast;
            })
            ->values()
            ->all();

        $years = CourseOffering::query()
            ->select('year')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year')
            ->values()
            ->all();

        $semesters = CourseOffering::query()
            ->select('sem')
            ->distinct()
            ->orderBy('sem')
            ->pluck('sem')
            ->values()
            ->all();

        return Inertia::render('Teachers/Index', [
            'teachers' => $teachers,
            'years' => $years,
            'semesters' => $semesters,
            'selectedYear' => $year,
            'selectedSemester' => $semester,
            'selectedFirstName' => $firstName,
            'selectedLastName' => $lastName,
        ]);
    }

    /**
     * Show the form for editing the specified teacher.
     */
    public function edit(User $teacher): Response
    {
        Gate::authorize('update', $teacher);

        return Inertia::render('Teachers/Form', [
            'teacher' => $teacher,
        ]);
    }

    /**
     * Update the specified teacher in storage.
     */
    public function update(User $teacher): RedirectResponse
    {
        Gate::authorize('update', $teacher);

        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $teacher->id,
        ]);

        $teacher->update($validated);

        return redirect()->route('teachers.index')->with('success', 'Teacher updated successfully.');
    }

    /**
     * Remove the specified teacher from storage.
     */
    public function destroy(User $teacher): RedirectResponse
    {
        Gate::authorize('delete', $teacher);

        $teacher->delete();

        return redirect()->route('teachers.index')->with('success', 'Teacher deleted successfully.');
    }
}
