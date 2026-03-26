<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexStudentsRequest;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\StudentMyCoursesRequest;
use App\Models\ClassRoster;
use App\Models\CourseOffering;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function myCourses(StudentMyCoursesRequest $request): Response
    {
        $user = $request->user();

        abort_unless($user?->isStudent(), 403);

        $courses = $user->classRostersAsStudent()
            ->with(['courseOffering.subject'])
            ->latest('date_encoded')
            ->get()
            ->map(function ($roster): array {
                return [
                    'id' => $roster->id,
                    'subject_code' => $roster->courseOffering?->subject?->code,
                    'subject_name' => $roster->courseOffering?->subject?->name,
                    'day' => $roster->courseOffering?->day,
                    'room' => $roster->courseOffering?->room,
                    'start_time' => $roster->courseOffering?->start_time,
                    'end_time' => $roster->courseOffering?->end_time,
                    'school_year' => $roster->courseOffering?->year,
                    'semester' => $roster->courseOffering?->sem,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Students/MyCourses', [
            'courses' => $courses,
        ]);
    }

    public function myGrades(StudentMyCoursesRequest $request): Response
    {
        $user = $request->user();

        abort_unless($user?->isStudent(), 403);

        $grades = $user->classRostersAsStudent()
            ->with(['courseOffering.subject', 'grade'])
            ->latest('date_encoded')
            ->get()
            ->map(function ($roster): array {
                return [
                    'id' => $roster->id,
                    'subject_code' => $roster->courseOffering?->subject?->code,
                    'subject_name' => $roster->courseOffering?->subject?->name,
                    'school_year' => $roster->courseOffering?->year,
                    'semester' => $roster->courseOffering?->sem,
                    'letter_grade' => $roster->grade?->letter_grade,
                    'points' => $roster->grade?->points !== null
                        ? round((float) $roster->grade?->points, 2)
                        : null,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Grades/MyGrades', [
            'grades' => $grades,
        ]);
    }

    public function registerCourses(StudentMyCoursesRequest $request): Response
    {
        $user = $request->user();

        abort_unless($user?->isStudent(), 403);

        $registeredCourseOfferingIds = ClassRoster::query()
            ->where('student_id', $user->id)
            ->pluck('co_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $year = $request->query('year');
        $semester = $request->query('semester');

        $year = $year && $year !== 'all' ? $year : null;
        $semester = $semester && $semester !== 'all' ? $semester : null;

        $courseOfferings = CourseOffering::query()
            ->with(['subject', 'teacher'])
            ->when($year, fn ($query) => $query->where('year', (int) $year))
            ->when($semester, fn ($query) => $query->where('sem', $semester))
            ->latest('date_encoded')
            ->get()
            ->map(function (CourseOffering $courseOffering) use ($registeredCourseOfferingIds): array {
                return [
                    'id' => $courseOffering->id,
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

        return Inertia::render('Students/RegisterCourses', [
            'courseOfferings' => $courseOfferings,
            'years' => $years,
            'semesters' => $semesters,
            'selectedYear' => $year,
            'selectedSemester' => $semester,
        ]);
    }

    /**
     * Display a listing of students with grade summaries.
     */
    public function index(IndexStudentsRequest $request): Response
    {
        $user = $request->user();

        abort_unless($user?->isAdmin() || $user?->isTeacher(), 403);

        $firstName = strtolower(trim((string) $request->validated('first_name', '')));
        $lastName = strtolower(trim((string) $request->validated('last_name', '')));

        $studentsQuery = User::query()
            ->where('role', 'student')
            ->with([
                'classRostersAsStudent' => function ($query) use ($user): void {
                    $query
                        ->when($user?->isTeacher(), function ($rosterQuery) use ($user): void {
                            $rosterQuery->whereHas('courseOffering', function ($courseOfferingQuery) use ($user): void {
                                $courseOfferingQuery->where('teacher_id', $user?->id);
                            });
                        })
                        ->with([
                            'courseOffering.subject',
                            'grade',
                        ]);
                },
            ])
            ->orderBy('name');

        if ($user?->isTeacher()) {
            $studentsQuery->whereHas('classRostersAsStudent.courseOffering', function (Builder $query) use ($user): void {
                $query->where('teacher_id', $user->id);
            });
        }

        $students = $studentsQuery
            ->get()
            ->map(function (User $student): array {
                $nameParts = preg_split('/\s+/', trim($student->name)) ?: [];
                $first = $nameParts[0] ?? '';
                $last = count($nameParts) > 1
                    ? trim(implode(' ', array_slice($nameParts, 1)))
                    : '';

                $detailedGrades = $student->classRostersAsStudent
                    ->map(function ($roster): array {
                        return [
                            'id' => $roster->id,
                            'subject_code' => $roster->courseOffering?->subject?->code,
                            'subject_name' => $roster->courseOffering?->subject?->name,
                            'school_year' => $roster->courseOffering?->year,
                            'semester' => $roster->courseOffering?->sem,
                            'letter_grade' => $roster->grade?->letter_grade,
                            'points' => $roster->grade?->points !== null
                                ? round((float) $roster->grade?->points, 2)
                                : null,
                        ];
                    })
                    ->values();

                $overallPoints = $detailedGrades
                    ->pluck('points')
                    ->filter(fn ($points) => $points !== null)
                    ->values();

                $overallGpa = $overallPoints->isNotEmpty()
                    ? round($overallPoints->avg(), 2)
                    : null;

                $termAverages = $this->computeTermAverages($detailedGrades);
                $semestralGpa = ! empty($termAverages)
                    ? $termAverages[0]['gpa']
                    : null;

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'first_name' => $first,
                    'last_name' => $last,
                    'semestral_gpa' => $semestralGpa,
                    'overall_gpa' => $overallGpa,
                    'detailed_grades' => $detailedGrades->all(),
                ];
            })
            ->filter(function (array $student) use ($firstName, $lastName): bool {
                $studentFirstName = strtolower($student['first_name']);
                $studentLastName = strtolower($student['last_name']);

                $matchesFirst = $firstName === '' || str_contains($studentFirstName, $firstName);
                $matchesLast = $lastName === '' || str_contains($studentLastName, $lastName);

                return $matchesFirst && $matchesLast;
            })
            ->values()
            ->all();

        return Inertia::render('Students/Index', [
            'students' => $students,
            'selectedFirstName' => $firstName,
            'selectedLastName' => $lastName,
        ]);
    }

    /**
     * @return array<int, array{school_year: int|null, semester: string|null, gpa: float}>
     */
    private function computeTermAverages(Collection $detailedGrades): array
    {
        $groupedTerms = $detailedGrades
            ->filter(fn (array $grade): bool => $grade['school_year'] !== null && $grade['points'] !== null)
            ->groupBy(fn (array $grade): string => $grade['school_year'].'-'.$grade['semester'])
            ->map(function (Collection $grades): array {
                $first = $grades->first();

                return [
                    'school_year' => $first['school_year'],
                    'semester' => $first['semester'],
                    'gpa' => round($grades->avg('points'), 2),
                ];
            })
            ->values()
            ->all();

        usort($groupedTerms, function (array $left, array $right): int {
            if ($left['school_year'] !== $right['school_year']) {
                return ($right['school_year'] ?? 0) <=> ($left['school_year'] ?? 0);
            }

            return $this->semesterRank((string) $right['semester']) <=> $this->semesterRank((string) $left['semester']);
        });

        return $groupedTerms;
    }

    private function semesterRank(string $semester): int
    {
        return match ($semester) {
            '2ND' => 2,
            '1ST' => 1,
            default => 0,
        };
    }

    /**
     * Show the form for creating a new student.
     */
    public function create(): Response
    {
        Gate::authorize('create', User::class);

        return Inertia::render('Students/Form');
    }

    /**
     * Store a newly created student in storage.
     */
    public function store(StoreStudentRequest $request): RedirectResponse
    {
        Gate::authorize('create', User::class);

        User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
            'role' => 'student',
        ]);

        return redirect()->route('students.index')->with('success', 'Student added successfully.');
    }

    /**
     * Show the form for editing the specified student.
     */
    public function edit(User $student): Response
    {
        Gate::authorize('update', $student);

        return Inertia::render('Students/Form', [
            'student' => $student,
        ]);
    }

    /**
     * Update the specified student in storage.
     */
    public function update(User $student): RedirectResponse
    {
        Gate::authorize('update', $student);

        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$student->id,
        ]);

        $student->update($validated);

        return redirect()->route('students.index')->with('success', 'Student updated successfully.');
    }

    /**
     * Remove the specified student from storage.
     */
    public function destroy(User $student): RedirectResponse
    {
        Gate::authorize('delete', $student);

        $student->delete();

        return redirect()->route('students.index')->with('success', 'Student deleted successfully.');
    }
}
