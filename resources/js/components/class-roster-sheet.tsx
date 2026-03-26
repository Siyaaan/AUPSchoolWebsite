import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

interface Student {
	id: number;
	name: string;
	email: string;
}

interface Course {
	id: number;
	subject: {
		name: string;
		code: string;
		description: string;
	};
	teacher?: {
		name: string;
	};
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

interface GradingSystem {
	id: number;
	letter_grade: string;
	points: number;
}

interface ClassRosterSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	course: Course | null;
	gradingSystems: GradingSystem[];
}

export default function ClassRosterSheet({
	open,
	onOpenChange,
	course,
	gradingSystems,
}: ClassRosterSheetProps) {
	const gradeLabel = (gradeId: number | null): string => {
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
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-3xl">
				<SheetHeader>
					<SheetTitle>
						{course ? `${course.subject.code} - ${course.subject.name}` : 'Class Roster'}
					</SheetTitle>
					<SheetDescription>
						{course
							? `${course.day} • ${course.start_time} - ${course.end_time} • ${course.room}`
							: 'View enrolled students and current grades.'}
					</SheetDescription>
				</SheetHeader>

				<div className="p-4 pt-0">
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Student</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Grade</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{!course || course.classRoster.length === 0 ? (
									<TableRow>
										<TableCell colSpan={3} className="py-8 text-center text-gray-500">
											No students enrolled
										</TableCell>
									</TableRow>
								) : (
									course.classRoster.map((row) => (
										<TableRow key={row.id}>
											<TableCell className="font-medium">{row.student.name}</TableCell>
											<TableCell>{row.student.email}</TableCell>
											<TableCell>{gradeLabel(row.grade_id)}</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
