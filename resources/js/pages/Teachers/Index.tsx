import { FormEvent, Fragment, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Eye, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
	first_name: string;
	last_name: string;
	courseOfferingsAsTeacher: CourseOffering[];
}

interface TeachersIndexProps {
	teachers: Teacher[];
	years: number[];
	semesters: string[];
	selectedYear?: number | null;
	selectedSemester?: string | null;
	selectedFirstName?: string;
	selectedLastName?: string;
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
	selectedFirstName = '',
	selectedLastName = '',
}: TeachersIndexProps) {
	const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [expandedTeachers, setExpandedTeachers] = useState<Set<number>>(new Set());

	const { data, setData } = useForm({
		year: selectedYear ? selectedYear.toString() : 'all',
		semester: selectedSemester || 'all',
		first_name: selectedFirstName,
		last_name: selectedLastName,
	});

	const handleFilterChange = (field: 'year' | 'semester', value: string | null) => {
		const nextValue = value ?? 'all';
		const nextData = {
			...data,
			[field]: nextValue,
		};

		setData(field, nextValue);

		router.get(teachersIndex().url, nextData, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
		});
	};

	const handleSearch = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault();

		router.get(teachersIndex().url, data, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
		});
	};

	const handleReset = (): void => {
		const resetData = {
			year: 'all',
			semester: 'all',
			first_name: '',
			last_name: '',
		};

		setData(resetData);

		router.get(teachersIndex().url, resetData, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
		});
	};

	const handleViewTeacher = (teacher: Teacher) => {
		setSelectedTeacher(teacher);
		setSheetOpen(true);
	};

	const handleEditTeacher = (teacherId: number) => {
		router.get(`/teachers/${teacherId}/edit`);
	};

	const handleDeleteTeacher = (teacherId: number) => {
		if (confirm('Are you sure you want to delete this teacher?')) {
			router.delete(`/teachers/${teacherId}`);
		}
	};

	const toggleTeachingLoads = (teacherId: number): void => {
		setExpandedTeachers((previous) => {
			const next = new Set(previous);

			if (next.has(teacherId)) {
				next.delete(teacherId);
			} else {
				next.add(teacherId);
			}

			return next;
		});
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

				<form className="grid gap-4 rounded-lg border bg-white p-4 sm:grid-cols-3" onSubmit={handleSearch}>
					<div className="space-y-2">
						<Label htmlFor="first_name">First Name</Label>
						<Input
							id="first_name"
							value={data.first_name}
							onChange={(event) => setData('first_name', event.target.value)}
							placeholder="Search first name"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="last_name">Last Name</Label>
						<Input
							id="last_name"
							value={data.last_name}
							onChange={(event) => setData('last_name', event.target.value)}
							placeholder="Search last name"
						/>
					</div>
					<div className="flex items-end gap-2">
						<Button type="submit">Search</Button>
						<Button type="button" variant="outline" onClick={handleReset}>
							Reset
						</Button>
					</div>
					<div className="space-y-2">
						<Label htmlFor="year">School Year</Label>
						<Select
							value={data.year || 'all'}
							onValueChange={(value) => handleFilterChange('year', value)}
						>
							<SelectTrigger id="year" className="w-full">
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
					<div className="space-y-2">
						<Label htmlFor="semester">Semester</Label>
						<Select
							value={data.semester || 'all'}
							onValueChange={(value) => handleFilterChange('semester', value)}
						>
							<SelectTrigger id="semester" className="w-full">
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
				</form>

				<div className="rounded-lg border bg-white">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>First Name</TableHead>
								<TableHead>Last Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead className="w-48">Teaching Loads</TableHead>
								<TableHead className="w-20">Details</TableHead>
								<TableHead className="w-24">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{teachers.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="py-8 text-center text-gray-500">
										No teachers found
									</TableCell>
								</TableRow>
							) : (
								teachers.map((teacher) => {
									const isExpanded = expandedTeachers.has(teacher.id);

									return (
										<Fragment key={teacher.id}>
											<TableRow>
												<TableCell className="font-medium">{teacher.first_name}</TableCell>
												<TableCell>{teacher.last_name}</TableCell>
												<TableCell>{teacher.email}</TableCell>
												<TableCell>
													<Button
														variant="outline"
														size="sm"
														onClick={() => toggleTeachingLoads(teacher.id)}
														className="gap-1"
													>
														{teacher.courseOfferingsAsTeacher.length} load
														{teacher.courseOfferingsAsTeacher.length !== 1 ? 's' : ''}
														{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
													</Button>
												</TableCell>
												<TableCell>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleViewTeacher(teacher)}
													>
														<Eye className="h-4 w-4" />
													</Button>
												</TableCell>
												<TableCell>
													<div className="flex gap-1">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleEditTeacher(teacher.id)}
															title="Edit teacher"
														>
															<Edit2 className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDeleteTeacher(teacher.id)}
															title="Delete teacher"
															className="text-destructive hover:text-destructive"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
											{isExpanded && (
												<TableRow>
													<TableCell colSpan={6} className="bg-muted/30">
														{teacher.courseOfferingsAsTeacher.length === 0 ? (
															<p className="py-2 text-sm text-muted-foreground">No teaching loads assigned.</p>
														) : (
															<div className="space-y-2 py-2">
																{teacher.courseOfferingsAsTeacher.map((course) => (
																	<div key={course.id} className="rounded-md border bg-background px-3 py-2 text-sm">
																		<div className="font-medium">{course.subject.code} - {course.subject.name}</div>
																		<div className="text-muted-foreground">
																			{course.day} • {course.start_time} - {course.end_time} • {course.room} • {course.year} • {course.sem}
																		</div>
																	</div>
																))}
															</div>
														)}
													</TableCell>
												</TableRow>
											)}
										</Fragment>
									);
								})
							)}
						</TableBody>
					</Table>
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
