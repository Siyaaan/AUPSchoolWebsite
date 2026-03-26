<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexStudentsRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Display a listing of students with grade summaries.
     */
    public function __invoke(IndexStudentsRequest $request): Response
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
}
