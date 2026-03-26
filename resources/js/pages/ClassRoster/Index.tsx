import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Eye } from 'lucide-react';
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
import { index as classRosterIndex } from '@/routes/classroster';
import ClassRosterSheet from '@/components/class-roster-sheet';
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

interface Teacher {
	id: number;
	name: string;
	email: string;
}

interface CourseOffering {
	id: number;
	subject: Subject;
	teacher: Teacher;
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

interface ClassRosterIndexProps {
	courseOfferings: CourseOffering[];
	years: number[];
	semesters: string[];
	gradingSystems: Array<{ id: number; letter_grade: string; points: number }>;
	selectedYear?: number | null;
	selectedSemester?: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Class Roster',
		href: classRosterIndex().url,
	},
];

export default function ClassRosterIndex({
	courseOfferings,
	years,
	semesters,
	gradingSystems,
	selectedYear,
	selectedSemester,
}: ClassRosterIndexProps) {
	const [selectedCourse, setSelectedCourse] = useState<CourseOffering | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);

	const { data, setData, get } = useForm({
		year: selectedYear || '',
		semester: selectedSemester || '',
	});

	const handleFilterChange = (field: 'year' | 'semester', value: string) => {
		setData(field, value === 'all' ? '' : value);
		setTimeout(() => {
			get(classRosterIndex().url);
		}, 0);
	};

	const handleViewRoster = (course: CourseOffering) => {
		setSelectedCourse(course);
		setSheetOpen(true);
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Class Roster" />
			<div className="space-y-6 p-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Class Roster</h1>
					<p className="mt-2 text-sm text-gray-600">
						View students enrolled in each course offering
					</p>
				</div>

				{/* Filters */}
				<div className="flex flex-col gap-4 sm:flex-row">
					<div className="flex-1">
						<label className="block text-sm font-medium text-gray-700 mb-2">
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

				{/* Course Offerings Table */}
				<div className="rounded-lg border bg-white">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Subject Code</TableHead>
								<TableHead>Subject Name</TableHead>
								<TableHead>Teacher</TableHead>
								<TableHead>Day</TableHead>
								<TableHead>Room</TableHead>
								<TableHead>Time</TableHead>
								<TableHead>Year</TableHead>
								<TableHead>Semester</TableHead>
								<TableHead className="w-20">Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{courseOfferings.length === 0 ? (
								<TableRow>
									<TableCell colSpan={9} className="text-center py-8 text-gray-500">
										No course offerings found
									</TableCell>
								</TableRow>
							) : (
								courseOfferings.map((course) => (
									<TableRow key={course.id}>
										<TableCell className="font-medium">
											{course.subject.code}
										</TableCell>
										<TableCell>{course.subject.name}</TableCell>
										<TableCell>{course.teacher.name}</TableCell>
										<TableCell>{course.day}</TableCell>
										<TableCell>{course.room}</TableCell>
										<TableCell>
											{course.start_time} - {course.end_time}
										</TableCell>
										<TableCell>{course.year}</TableCell>
										<TableCell>{course.sem}</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleViewRoster(course)}
											>
												<Eye className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			<ClassRosterSheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				course={selectedCourse}
				gradingSystems={gradingSystems}
			/>
		</AppLayout>
	);
}
