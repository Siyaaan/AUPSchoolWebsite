import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
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
import { index as teachersIndex } from '@/routes/teachers';
import TeacherDetailsSheet from '@/components/teacher-details-sheet';
import type { BreadcrumbItem } from '@/types';
import { useForm } from '@inertiajs/react';

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
	day: string;
	room: string;
	start_time: string;
	end_time: string;
	year: number;
	sem: string;
	classRoster: Array<{
		id: number;
		student: Student;
		date_encoded: string;
	}>;
}

interface Teacher {
	id: number;
	name: string;
	email: string;
	courseOfferingsAsTeacher: CourseOffering[];
}

interface TeachersIndexProps {
	teachers: Teacher[];
	years: number[];
	semesters: string[];
	selectedYear?: number | null;
	selectedSemester?: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Teachers',
		href: teachersIndex().url,
	},
];

export default function TeachersIndex({
	teachers,
	years,
	semesters,
	selectedYear,
	selectedSemester,
}: TeachersIndexProps) {
	const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [expandedTeachers, setExpandedTeachers] = useState<Set<number>>(new Set());

	const { data, setData, get } = useForm({
		year: selectedYear ? selectedYear.toString() : 'all',
		semester: selectedSemester || 'all',
	});

	const handleFilterChange = (field: 'year' | 'semester', value: string | null) => {
		setData(field, value ?? 'all');
		setTimeout(() => {
			get(teachersIndex().url);
		}, 0);
	};

	const toggleTeacher = (teacherId: number) => {
		const newExpanded = new Set(expandedTeachers);
		if (newExpanded.has(teacherId)) {
			newExpanded.delete(teacherId);
		} else {
			newExpanded.add(teacherId);
		}
		setExpandedTeachers(newExpanded);
	};

	const handleViewTeacher = (teacher: Teacher) => {
		setSelectedTeacher(teacher);
		setSheetOpen(true);
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Teachers" />
			<div className="space-y-6 p-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
					<p className="mt-2 text-sm text-gray-600">
						View teacher teaching loads and class rosters by school year and semester
					</p>
				</div>

				{/* Filters */}
				<div className="flex flex-col gap-4 sm:flex-row">
					<div className="flex-1">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							School Year
						</label>
						<Select
							value={data.year || 'all'}
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
						<label className="block text-sm font-medium text-gray-700 mb-2">
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

				{/* Teachers List */}
				<div className="space-y-4">
					{teachers.length === 0 ? (
						<div className="rounded-lg border bg-white p-8 text-center text-gray-500">
							No teachers found
						</div>
					) : (
						teachers.map((teacher) => (
							<div key={teacher.id} className="rounded-lg border bg-white overflow-hidden">
								{/* Teacher Header */}
								<div className="flex items-center justify-between p-4 hover:bg-gray-50">
									<div className="flex-1">
										<h3 className="font-semibold text-lg">{teacher.name}</h3>
										<p className="text-sm text-gray-600">{teacher.email}</p>
										<p className="text-sm text-gray-600 mt-1">
											{teacher.courseOfferingsAsTeacher.length} course
											{teacher.courseOfferingsAsTeacher.length !== 1 ? 's' : ''}
										</p>
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleViewTeacher(teacher)}
										>
											<Eye className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => toggleTeacher(teacher.id)}
										>
											{expandedTeachers.has(teacher.id) ? (
												<ChevronUp className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											)}
										</Button>
									</div>
								</div>

								{/* Teaching Loads (Expandable) */}
								{expandedTeachers.has(teacher.id) && teacher.courseOfferingsAsTeacher.length > 0 && (
									<div className="border-t">
										<Table>
											<TableHeader>
												<TableRow className="bg-gray-50">
													<TableHead>Subject Code</TableHead>
													<TableHead>Subject Name</TableHead>
													<TableHead>Day</TableHead>
													<TableHead>Room</TableHead>
													<TableHead>Time</TableHead>
													<TableHead>Year</TableHead>
													<TableHead>Semester</TableHead>
													<TableHead>Students</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{teacher.courseOfferingsAsTeacher.map((course) => (
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
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								)}
							</div>
						))
					)}
				</div>
			</div>

			<TeacherDetailsSheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				teacher={selectedTeacher}
			/>
		</AppLayout>
	);
}
