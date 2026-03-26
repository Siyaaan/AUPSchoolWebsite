<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateClassRosterRequest;
use App\Models\ClassRoster;
use App\Models\CourseOffering;
use App\Models\GradingSystem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class GradesController extends Controller
{
    /**
     * Display the grade encoding page for the authenticated teacher.
     */
    public function __invoke(Request $request): Response
    {
        abort_unless($request->user()?->isTeacher(), 403);

        $year = $request->query('year');
        $semester = $request->query('semester');

        $year = $year && $year !== 'all' ? $year : null;
        $semester = $semester && $semester !== 'all' ? $semester : null;

        $courseOfferings = CourseOffering::query()
            ->where('teacher_id', $request->user()->id)
            ->with(['subject', 'classRoster.student'])
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
                        'name' => $courseOffering->teacher?->name ?? '',
                    ],
                    'day' => $courseOffering->day,
                    'room' => $courseOffering->room,
                    'start_time' => $courseOffering->start_time,
                    'end_time' => $courseOffering->end_time,
                    'year' => $courseOffering->year,
                    'sem' => $courseOffering->sem,
                    'classRoster' => $courseOffering->classRoster
                        ->map(fn ($roster) => [
                            'id' => $roster->id,
                            'student' => [
                                'id' => $roster->student?->id,
                                'name' => $roster->student?->name,
                                'email' => $roster->student?->email,
                            ],
                            'grade_id' => $roster->grade_id,
                            'date_encoded' => $roster->date_encoded,
                        ])
                        ->values()
                        ->all(),
                ];
            })
            ->values()
            ->all();

        $years = CourseOffering::query()
            ->where('teacher_id', $request->user()->id)
            ->select('year')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year')
            ->values()
            ->all();

        $semesters = CourseOffering::query()
            ->where('teacher_id', $request->user()->id)
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

        return Inertia::render('Grades/Index', [
            'courseOfferings' => $courseOfferings,
            'years' => $years,
            'semesters' => $semesters,
            'gradingSystems' => $gradingSystems,
            'selectedYear' => $year,
            'selectedSemester' => $semester,
        ]);
    }

    /**
     * Encode and save a student's grade in the class_roster table.
     */
    public function update(UpdateClassRosterRequest $request, ClassRoster $classRoster): RedirectResponse
    {
        abort_unless($request->user()?->isTeacher(), 403);

        Gate::authorize('update', $classRoster);

        $classRoster->update([
            'grade_id' => $request->validated()['grade_id'],
            'encoded_by' => $request->user()->id,
        ]);

        return back()->with('status', 'Grade encoded successfully.');
    }
}
