import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogClose,
} from '@/components/ui/dialog';
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

interface CourseOffering {
	id: number;
	subject: {
		name: string | null;
		code: string | null;
	};
	teacher: {
		name: string | null;
		email: string | null;
	};
	day: string | null;
	room: string | null;
	start_time: string | null;
	end_time: string | null;
	year: number | null;
	sem: string | null;
	is_registered: boolean;
}

interface CourseRegistrationProps {
	courseOfferings: CourseOffering[];
	years: number[];
	semesters: string[];
	selectedYear?: string | null;
	selectedSemester?: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Register for Courses',
		href: '/register-courses',
	},
];

const normalizeTime = (value: string | null): string => {
	if (!value) {
		return '';
	}

	return value.slice(0, 5);
};

export default function CourseRegistration({
	courseOfferings,
	years,
	semesters,
	selectedYear,
	selectedSemester,
}: CourseRegistrationProps) {
	const [filterYear, setFilterYear] = useState(selectedYear || '');
	const [filterSemester, setFilterSemester] = useState(selectedSemester || '');
	const [selectedCourse, setSelectedCourse] = useState<CourseOffering | null>(null);
	const [isRegistering, setIsRegistering] = useState(false);

	const handleFilterChange = (): void => {
		const params = new URLSearchParams();
		if (filterYear) params.append('year', filterYear);
		if (filterSemester) params.append('semester', filterSemester);

		router.get(`/register-courses?${params.toString()}`, {}, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
		});
	};

	const handleRegister = (course: CourseOffering): void => {
		setSelectedCourse(course);
	};

	const handleConfirmRegistration = (): void => {
		if (!selectedCourse) return;

		setIsRegistering(true);

		router.post(`/course-offerings/${selectedCourse.id}/register`, {}, {
			onSuccess: () => {
				setSelectedCourse(null);
				setIsRegistering(false);
			},
			onError: () => {
				setIsRegistering(false);
			},
		});
	};

	const filteredCourses = courseOfferings;
	const registeredCount = filteredCourses.filter(c => c.is_registered).length;
	const availableCount = filteredCourses.filter(c => !c.is_registered).length;

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Register for Courses" />
			<div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
				{/* Stats */}
				<div className="grid gap-4 md:grid-cols-2">
					<div className="rounded-lg border border-sidebar-border bg-white p-4 dark:border-sidebar-border dark:bg-slate-950">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-neutral-600 dark:text-neutral-400">Registered Courses</p>
								<p className="text-3xl font-bold text-blue-600">{registeredCount}</p>
							</div>
						</div>
					</div>
					<div className="rounded-lg border border-sidebar-border bg-white p-4 dark:border-sidebar-border dark:bg-slate-950">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-neutral-600 dark:text-neutral-400">Available Courses</p>
								<p className="text-3xl font-bold text-yellow-600">{availableCount}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className="rounded-xl border border-sidebar-border bg-white p-4 dark:border-sidebar-border dark:bg-slate-950">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end">
						<div className="flex-1">
							<label className="mb-2 block text-sm font-medium">School Year</label>
							<Select value={filterYear} onValueChange={setFilterYear}>
								<SelectTrigger>
									<SelectValue placeholder="All Years" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">All Years</SelectItem>
									{years.map(year => (
										<SelectItem key={year} value={String(year)}>
											{year}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex-1">
							<label className="mb-2 block text-sm font-medium">Semester</label>
							<Select value={filterSemester} onValueChange={setFilterSemester}>
								<SelectTrigger>
									<SelectValue placeholder="All Semesters" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">All Semesters</SelectItem>
									{semesters.map(sem => (
										<SelectItem key={sem} value={sem}>
											{sem}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<Button onClick={handleFilterChange} className="w-full sm:w-auto">
							Filter
						</Button>
					</div>
				</div>

				{/* Courses Table */}
				<div className="overflow-hidden rounded-xl border border-sidebar-border dark:border-sidebar-border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Subject Code</TableHead>
								<TableHead>Subject Name</TableHead>
								<TableHead>Teacher</TableHead>
								<TableHead>Schedule</TableHead>
								<TableHead>Room</TableHead>
								<TableHead>Year</TableHead>
								<TableHead>Sem</TableHead>
								<TableHead>Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredCourses.length > 0 ? (
								filteredCourses.map(course => (
									<TableRow key={course.id}>
										<TableCell className="font-medium">{course.subject?.code || 'N/A'}</TableCell>
										<TableCell>{course.subject?.name || 'N/A'}</TableCell>
										<TableCell className="text-sm">{course.teacher?.name || 'N/A'}</TableCell>
										<TableCell>
											{course.day && course.start_time && course.end_time
												? `${course.day} ${normalizeTime(course.start_time)}-${normalizeTime(course.end_time)}`
												: 'N/A'}
										</TableCell>
										<TableCell>{course.room || 'N/A'}</TableCell>
										<TableCell>{course.year || 'N/A'}</TableCell>
										<TableCell>{course.sem || 'N/A'}</TableCell>
										<TableCell>
											{course.is_registered ? (
												<div className="flex items-center gap-2 text-green-600">
													<CheckCircle2 className="size-4" />
													<span className="text-sm font-medium">Registered</span>
												</div>
											) : (
												<Button
													size="sm"
													variant="default"
													disabled={course.is_registered}
													onClick={() => handleRegister(course)}
												>
													Register
												</Button>
											)}
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={8} className="py-8 text-center text-neutral-500">
										No courses available
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Registration Confirmation Dialog */}
			<Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Registration</DialogTitle>
						<DialogDescription>
							Are you sure you want to register for{' '}
							<span className="font-semibold text-neutral-900 dark:text-neutral-100">
								{selectedCourse?.subject?.name}
							</span>
							?
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-2 rounded-lg bg-neutral-100 p-3 dark:bg-slate-900">
						<div className="text-sm">
							<span className="text-neutral-600 dark:text-neutral-400">Teacher: </span>
							<span className="font-medium">{selectedCourse?.teacher?.name}</span>
						</div>
						<div className="text-sm">
							<span className="text-neutral-600 dark:text-neutral-400">Schedule: </span>
							<span className="font-medium">
								{selectedCourse?.day} {normalizeTime(selectedCourse?.start_time ?? '')}-
								{normalizeTime(selectedCourse?.end_time ?? '')}
							</span>
						</div>
						<div className="text-sm">
							<span className="text-neutral-600 dark:text-neutral-400">Room: </span>
							<span className="font-medium">{selectedCourse?.room}</span>
						</div>
					</div>
					<DialogFooter className="gap-2 sm:gap-0">
						<DialogClose asChild>
							<Button variant="outline">Cancel</Button>
						</DialogClose>
						<Button
							onClick={handleConfirmRegistration}
							disabled={isRegistering}
							className="flex gap-2"
						>
							{isRegistering && <Loader2 className="size-4 animate-spin" />}
							{isRegistering ? 'Registering...' : 'Confirm Registration'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</AppLayout>
	);
}
