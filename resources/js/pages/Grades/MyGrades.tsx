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

interface Grade {
	id: number;
	subject_code: string | null;
	subject_name: string | null;
	school_year: number | null;
	semester: string | null;
	letter_grade: string | null;
	points: number | null;
}

interface MyGradesProps {
	grades: Grade[];
}

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'My Grades',
		href: '/my-grades',
	},
];

const formatGrade = (value: string | number | null): string => {
	if (value === null) {
		return 'N/A';
	}
	return String(value);
};

export default function MyGrades({ grades }: MyGradesProps) {
	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="My Grades" />
			<div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
				<div className="rounded-xl border border-sidebar-border dark:border-sidebar-border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Subject Code</TableHead>
								<TableHead>Subject Name</TableHead>
								<TableHead>School Year</TableHead>
								<TableHead>Semester</TableHead>
								<TableHead>Letter Grade</TableHead>
								<TableHead>Points</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{grades.length > 0 ? (
								grades.map((grade) => (
									<TableRow key={grade.id}>
										<TableCell className="font-medium">{grade.subject_code || 'N/A'}</TableCell>
										<TableCell>{grade.subject_name || 'N/A'}</TableCell>
										<TableCell>{grade.school_year || 'N/A'}</TableCell>
										<TableCell>{grade.semester || 'N/A'}</TableCell>
										<TableCell className="font-semibold">{formatGrade(grade.letter_grade)}</TableCell>
										<TableCell>{formatGrade(grade.points)}</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-8 text-neutral-500">
										No grades available
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
