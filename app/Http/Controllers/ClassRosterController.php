<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateClassRosterRequest;
use App\Models\ClassRoster;
use App\Models\CourseOffering;
use App\Models\GradingSystem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ClassRosterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        Gate::authorize('viewAny', ClassRoster::class);

        $year = request('year');
        $semester = request('semester');

        // Ignore 'all' sentinel value for filters
        $year = $year && $year !== 'all' ? $year : null;
        $semester = $semester && $semester !== 'all' ? $semester : null;

        $courseOfferings = CourseOffering::query()
            ->with(['subject', 'teacher', 'classRoster.student'])
            ->when($year, fn ($q) => $q->where('year', $year))
            ->when($semester, fn ($q) => $q->where('sem', $semester))
            ->latest('date_encoded')
            ->get()
            ->map(function (CourseOffering $courseOffering): array {
                return [
                    'id' => $courseOffering->id,
                    'subject' => [
                        'name' => $courseOffering->subject?->name,
                        'code' => $courseOffering->subject?->code,
                        'description' => $courseOffering->subject?->description,
                    ],
                    'teacher' => [
                        'id' => $courseOffering->teacher?->id,
                        'name' => $courseOffering->teacher?->name,
                        'email' => $courseOffering->teacher?->email,
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
                                'grade_id' => $roster->grade_id,
                                'date_encoded' => $roster->date_encoded,
                            ];
                        })
                        ->values()
                        ->all(),
                ];
            })
            ->values()
            ->all();

        // Get unique years and semesters for filters
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

        $gradingSystems = GradingSystem::query()
            ->orderByDesc('points')
            ->get()
            ->map(fn ($grade) => [
                'id' => $grade->id,
                'letter_grade' => $grade->letter_grade,
                'points' => $grade->points,
            ])
            ->values()
            ->all();

        return Inertia::render('ClassRoster/Index', [
            'courseOfferings' => $courseOfferings,
            'years' => $years,
            'semesters' => $semesters,
            'gradingSystems' => $gradingSystems,
            'selectedYear' => $year,
            'selectedSemester' => $semester,
        ]);
    }

    /**
     * Update the specified class roster record with a grade.
     */
    public function update(UpdateClassRosterRequest $request, ClassRoster $classRoster): RedirectResponse
    {
        Gate::authorize('update', $classRoster);

        $classRoster->update([
            'grade_id' => $request->validated()['grade_id'],
            'encoded_by' => $request->user()->id,
        ]);

        return back()->with('status', 'Grade updated successfully.');
    }
}
