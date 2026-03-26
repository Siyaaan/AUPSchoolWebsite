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

interface CourseOffering {
	id: number;
	subject: {
		name: string;
		code: string;
		description: string;
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
		date_encoded: string;
	}>;
}

interface Teacher {
	id: number;
	name: string;
	email: string;
	birthday?: string | null;
	account_created?: string | null;
	courseOfferingsAsTeacher: CourseOffering[];
}

interface TeacherDetailsSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	teacher: Teacher | null;
}

export default function TeacherDetailsSheet({
	open,
	onOpenChange,
	teacher,
}: TeacherDetailsSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-3xl">
				<SheetHeader>
					<SheetTitle>{teacher?.name ?? 'Teacher Details'}</SheetTitle>
					<SheetDescription>
						{teacher?.email ?? 'View assigned teaching loads and class size.'}
					</SheetDescription>
				</SheetHeader>

				<div className="space-y-4 p-4 pt-0">
					<div className="grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
						<div>
							<span className="font-medium">Birthday:</span> {teacher?.birthday || 'N/A'}
						</div>
						<div>
							<span className="font-medium">Account Created:</span>{' '}
							{teacher?.account_created || 'N/A'}
						</div>
					</div>

					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Subject</TableHead>
									<TableHead>Day</TableHead>
									<TableHead>Room</TableHead>
									<TableHead>Time</TableHead>
									<TableHead>Year</TableHead>
									<TableHead>Semester</TableHead>
									<TableHead>Students</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{!teacher || teacher.courseOfferingsAsTeacher.length === 0 ? (
									<TableRow>
										<TableCell colSpan={7} className="py-8 text-center text-gray-500">
											No teaching load found
										</TableCell>
									</TableRow>
								) : (
									teacher.courseOfferingsAsTeacher.map((course) => (
										<TableRow key={course.id}>
											<TableCell className="font-medium">
												{course.subject.code} - {course.subject.name}
											</TableCell>
											<TableCell>{course.day}</TableCell>
											<TableCell>{course.room}</TableCell>
											<TableCell>
												{course.start_time} - {course.end_time}
											</TableCell>
											<TableCell>{course.year}</TableCell>
											<TableCell>{course.sem}</TableCell>
											<TableCell>{course.classRoster.length}</TableCell>
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
