<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterCourseOfferingRequest;
use App\Http\Requests\StoreCourseOfferingRequest;
use App\Http\Requests\UpdateCourseOfferingRequest;
use App\Models\ClassRoster;
use App\Models\CourseOffering;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CourseOfferingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        Gate::authorize('viewAny', CourseOffering::class);

        $user = request()->user();
        $canManage = $user?->isAdmin() ?? false;
        $registeredCourseOfferingIds = $user?->isStudent()
            ? ClassRoster::query()
                ->where('student_id', $user->id)
                ->pluck('co_id')
                ->map(fn ($id) => (int) $id)
                ->all()
            : [];

        $year = request('year');
        $semester = request('semester');

        $year = $year && $year !== 'all' ? $year : null;
        $semester = $canManage && $semester && $semester !== 'all' ? $semester : null;

        $courseOfferings = CourseOffering::query()
            ->with(['subject', 'teacher'])
            ->when($year, fn ($query) => $query->where('year', (int) $year))
            ->when($semester, fn ($query) => $query->where('sem', $semester))
            ->latest('date_encoded')
            ->get()
            ->map(function (CourseOffering $courseOffering) use ($registeredCourseOfferingIds): array {
                return [
                    'id' => $courseOffering->id,
                    'subject_id' => $courseOffering->subject_id,
                    'teacher_id' => $courseOffering->teacher_id,
                    'subject' => [
                        'name' => $courseOffering->subject?->name,
                        'code' => $courseOffering->subject?->code,
                    ],
                    'teacher' => [
                        'name' => $courseOffering->teacher?->name,
                        'email' => $courseOffering->teacher?->email,
                    ],
                    'day' => $courseOffering->day,
                    'room' => $courseOffering->room,
                    'start_time' => $courseOffering->start_time,
                    'end_time' => $courseOffering->end_time,
                    'year' => $courseOffering->year,
                    'sem' => $courseOffering->sem,
                    'is_registered' => in_array($courseOffering->id, $registeredCourseOfferingIds, true),
                ];
            })
            ->values()
            ->all();

        $years = CourseOffering::query()
            ->select('year')
            ->whereNotNull('year')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year')
            ->values()
            ->all();

        $semesters = CourseOffering::query()
            ->select('sem')
            ->whereNotNull('sem')
            ->distinct()
            ->orderBy('sem')
            ->pluck('sem')
            ->values()
            ->all();

        return Inertia::render('CourseOfferings/Index', [
            'courseOfferings' => $courseOfferings,
            'years' => $years,
            'semesters' => $semesters,
            'selectedYear' => $year,
            'selectedSemester' => $semester,
            'canManage' => $canManage,
            'studentIdNumber' => $user?->isStudent() ? $user->id : null,
            'subjects' => $canManage
                ? Subject::query()
                    ->select('id', 'name', 'code')
                    ->orderBy('name')
                    ->get()
                : [],
            'teachers' => $canManage
                ? User::query()
                    ->where('role', 'teacher')
                    ->select('id', 'name', 'email')
                    ->orderBy('name')
                    ->get()
                : [],
        ]);
    }

    /**
     * Register the authenticated student to a selected course offering.
     */
    public function register(RegisterCourseOfferingRequest $request, CourseOffering $courseOffering): RedirectResponse
    {
        abort_unless($request->user()?->isStudent(), 403);

        $alreadyRegistered = ClassRoster::query()
            ->where('co_id', $courseOffering->id)
            ->where('student_id', $request->user()->id)
            ->exists();

        if ($alreadyRegistered) {
            return back()->withErrors([
                'id_number' => 'You are already registered for this course offering.',
            ]);
        }

        ClassRoster::query()->create([
            'co_id' => $courseOffering->id,
            'student_id' => $request->user()->id,
            'grade_id' => null,
            'encoded_by' => $request->user()->id,
            'date_encoded' => now(),
        ]);

        return back()->with('status', 'Registration successful.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCourseOfferingRequest $request): RedirectResponse
    {
        Gate::authorize('create', CourseOffering::class);

        CourseOffering::create([
            ...$request->validated(),
            'encoded_by' => $request->user()?->id,
            'date_encoded' => now(),
        ]);

        return redirect()->route('course-offerings.index')->with('success', 'Course offering created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCourseOfferingRequest $request, CourseOffering $courseOffering): RedirectResponse
    {
        Gate::authorize('update', $courseOffering);

        $courseOffering->update($request->validated());

        return redirect()->route('course-offerings.index')->with('success', 'Course offering updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CourseOffering $courseOffering): RedirectResponse
    {
        Gate::authorize('delete', $courseOffering);

        $courseOffering->delete();

        return redirect()->route('course-offerings.index')->with('success', 'Course offering deleted successfully.');
    }
}
