<?php

namespace App\Http\Controllers;

use App\Models\CourseOffering;
use App\Models\User;
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
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'email' => $teacher->email,
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
        ]);
    }
}
