import { useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Student {
	id: number;
	name: string;
	email: string;
}

interface Subject {
	name: string;
	code: string;
	description: string;
}

interface CourseOffering {
	id: number;
	subject: Subject;
	teacher: { name: string };
	day: string;
	room: string;
	start_time: string;
	end_time: string;
	year: number;
	sem: string;
	classRoster: Array<{
		id: number;
		student: Student;
		grade_id: number | null;
		date_encoded: string;
	}>;
}

interface GradesIndexProps {
	courseOfferings: CourseOffering[];
	years: number[];
	semesters: string[];
	gradingSystems: Array<{ id: number; letter_grade: string; points: number }>;
	selectedYear?: number | null;
	selectedSemester?: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Grades',
		href: '/grades',
	},
];

export default function GradesIndex({
	courseOfferings,
	years,
	semesters,
	gradingSystems,
	selectedYear,
	selectedSemester,
}: GradesIndexProps) {
	const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
	const [selectedGrades, setSelectedGrades] = useState<Record<number, string>>({});
	const [savingRosterId, setSavingRosterId] = useState<number | null>(null);
	const [gradeErrors, setGradeErrors] = useState<Record<number, string>>({});

	const { data, setData, get } = useForm({
		year: selectedYear?.toString() || '',
		semester: selectedSemester || '',
	});

	const selectedCourse = useMemo(
		() =>
			selectedCourseId
				? (courseOfferings.find((course) => course.id === selectedCourseId) ?? null)
				: null,
		[selectedCourseId, courseOfferings],
	);

	const handleFilterChange = (field: 'year' | 'semester', value: string) => {
		const newValue = value === 'all' ? '' : value;
		setData(field, newValue);
		setTimeout(() => {
			get('/grades', { preserveState: true });
		}, 0);
	};

	const handleOpenEncoding = (course: CourseOffering) => {
		setSelectedCourseId(course.id);
		const initialGrades = course.classRoster.reduce<Record<number, string>>((carry, roster) => {
			carry[roster.id] = roster.grade_id?.toString() ?? '';
			return carry;
		}, {});
		setSelectedGrades(initialGrades);
		setGradeErrors({});
	};

	const handleSaveGrade = (rosterId: number) => {
		const selectedGrade = selectedGrades[rosterId] ?? '';

		if (!selectedGrade) {
			setGradeErrors((current) => ({
				...current,
				[rosterId]: 'A grade must be selected.',
			}));
			return;
		}

		setSavingRosterId(rosterId);

		router.put(
			`/grades/classroster/${rosterId}`,
			{ grade_id: selectedGrade },
			{
				preserveScroll: true,
				onSuccess: () => {
					setGradeErrors((current) => {
						const updated = { ...current };
						delete updated[rosterId];
						return updated;
					});
				},
				onError: (errors) => {
					setGradeErrors((current) => ({
						...current,
						[rosterId]: (errors.grade_id as string | undefined) ?? 'The selected grade is invalid.',
					}));
				},
				onFinish: () => {
					setSavingRosterId(null);
				},
			},
		);
	};

	const getGradeLabel = (gradeId: number | null) => {
		if (!gradeId) {
			return 'No grade';
		}

		const grade = gradingSystems.find((item) => item.id === gradeId);

		if (!grade) {
			return 'No grade';
		}

		return `${grade.letter_grade} (${grade.points})`;
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Grades" />
			<div className="space-y-6 p-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Grade Encoding</h1>
					<p className="mt-2 text-sm text-gray-600">
						Encode and save student grades using the configured grading system reference.
					</p>
				</div>

				<div className="flex flex-col gap-4 sm:flex-row">
					<div className="flex-1">
						<label className="mb-2 block text-sm font-medium text-gray-700">
							School Year
						</label>
						<Select
							value={data.year?.toString() || 'all'}
							onValueChange={(value) => handleFilterChange('year', value)}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="All Years" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Years</SelectItem>
								{years.map((year) => (
									<SelectItem key={year} value={year.toString()}>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex-1">
						<label className="mb-2 block text-sm font-medium text-gray-700">
							Semester
						</label>
						<Select
							value={data.semester || 'all'}
							onValueChange={(value) => handleFilterChange('semester', value)}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="All Semesters" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Semesters</SelectItem>
								{semesters.map((sem) => (
									<SelectItem key={sem} value={sem}>
										{sem}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="rounded-lg border bg-white">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Subject Code</TableHead>
								<TableHead>Subject Name</TableHead>
								<TableHead>Day</TableHead>
								<TableHead>Room</TableHead>
								<TableHead>Time</TableHead>
								<TableHead>Year</TableHead>
								<TableHead>Semester</TableHead>
								<TableHead>Students</TableHead>
								<TableHead className="w-28">Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{courseOfferings.length === 0 ? (
								<TableRow>
									<TableCell colSpan={9} className="py-8 text-center text-gray-500">
										No classes available for grade encoding
									</TableCell>
								</TableRow>
							) : (
								courseOfferings.map((course) => (
									<TableRow key={course.id}>
										<TableCell className="font-medium">
											{course.subject.code}
										</TableCell>
										<TableCell>{course.subject.name}</TableCell>
										<TableCell>{course.day}</TableCell>
										<TableCell>{course.room}</TableCell>
										<TableCell>
											{course.start_time} - {course.end_time}
										</TableCell>
										<TableCell>{course.year}</TableCell>
										<TableCell>{course.sem}</TableCell>
										<TableCell>{course.classRoster.length}</TableCell>
										<TableCell>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleOpenEncoding(course)}
											>
												<PenSquare className="mr-2 h-4 w-4" />
												Encode
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				{selectedCourse ? (
					<div className="space-y-4 rounded-lg border bg-white p-4">
						<div>
							<h2 className="text-lg font-semibold">Selected Class for Grade Encoding</h2>
							<p className="text-sm text-gray-600">
								{selectedCourse.subject.code} - {selectedCourse.subject.name} ({selectedCourse.year} / {selectedCourse.sem})
							</p>
						</div>

						<div className="grid gap-4 lg:grid-cols-3">
							<div className="lg:col-span-2 rounded-lg border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Student</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Current Grade</TableHead>
											<TableHead>Encode Grade</TableHead>
											<TableHead className="w-28">Save</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{selectedCourse.classRoster.length === 0 ? (
											<TableRow>
												<TableCell colSpan={5} className="py-8 text-center text-gray-500">
													No students enrolled for this class
												</TableCell>
											</TableRow>
										) : (
											selectedCourse.classRoster.map((roster) => (
												<TableRow key={roster.id}>
													<TableCell className="font-medium">{roster.student.name}</TableCell>
													<TableCell>{roster.student.email}</TableCell>
													<TableCell>{getGradeLabel(roster.grade_id)}</TableCell>
													<TableCell>
														<div className="space-y-1">
															<Select
																value={selectedGrades[roster.id] || undefined}
																onValueChange={(value) => {
																	setSelectedGrades((current) => ({ ...current, [roster.id]: value }));
																	setGradeErrors((current) => {
																		const updated = { ...current };
																		delete updated[roster.id];
																		return updated;
																	});
																}}
																disabled={savingRosterId === roster.id}
															>
																<SelectTrigger className="h-8">
																	<SelectValue placeholder="Select grade" />
																</SelectTrigger>
																<SelectContent>
																	{gradingSystems.map((grade) => (
																		<SelectItem key={grade.id} value={grade.id.toString()}>
																			{grade.letter_grade} ({grade.points} points)
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															{gradeErrors[roster.id] ? (
																<p className="text-xs text-red-600">{gradeErrors[roster.id]}</p>
															) : null}
														</div>
													</TableCell>
													<TableCell>
														<Button
															size="sm"
															onClick={() => handleSaveGrade(roster.id)}
															disabled={savingRosterId === roster.id}
														>
															{savingRosterId === roster.id ? 'Saving...' : 'Save Grade'}
														</Button>
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</div>

							<div className="rounded-lg border p-3">
								<h3 className="mb-3 text-sm font-semibold">Grading System Reference</h3>
								<div className="space-y-2">
									{gradingSystems.map((grade) => (
										<div key={grade.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
											<span className="font-medium">{grade.letter_grade}</span>
											<span className="text-gray-600">{grade.points} points</span>
										</div>
									))}
								</div>
								<p className="mt-3 flex items-center gap-1 text-xs text-gray-600">
									<Check className="h-3.5 w-3.5" />
									Grade input is validated against available grading system entries.
								</p>
							</div>
						</div>
					</div>
				) : null}
			</div>
		</AppLayout>
	);
}
