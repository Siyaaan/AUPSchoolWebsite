import { Head } from '@inertiajs/react';
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

interface Course {
	id: number;
	subject_code: string | null;
	subject_name: string | null;
	day: string | null;
	room: string | null;
	start_time: string | null;
	end_time: string | null;
	school_year: number | null;
	semester: string | null;
}

interface MyCoursesProps {
	courses: Course[];
}

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'My Courses',
		href: '/my-courses',
	},
];

export default function MyCourses({ courses }: MyCoursesProps) {
	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="My Courses" />
			<div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
				<div className="rounded-xl border border-sidebar-border dark:border-sidebar-border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Subject Code</TableHead>
								<TableHead>Subject Name</TableHead>
								<TableHead>Day</TableHead>
								<TableHead>Room</TableHead>
								<TableHead>Time</TableHead>
								<TableHead>School Year</TableHead>
								<TableHead>Semester</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{courses.length > 0 ? (
								courses.map((course) => (
									<TableRow key={course.id}>
										<TableCell className="font-medium">{course.subject_code || 'N/A'}</TableCell>
										<TableCell>{course.subject_name || 'N/A'}</TableCell>
										<TableCell>{course.day || 'N/A'}</TableCell>
										<TableCell>{course.room || 'N/A'}</TableCell>
										<TableCell>
											{course.start_time && course.end_time
												? `${course.start_time} - ${course.end_time}`
												: 'N/A'}
										</TableCell>
										<TableCell>{course.school_year || 'N/A'}</TableCell>
										<TableCell>{course.semester || 'N/A'}</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={7} className="text-center py-8 text-neutral-500">
										No courses enrolled
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
		</AppLayout>
	);
}
