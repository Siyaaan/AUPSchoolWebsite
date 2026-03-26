import { FormEvent, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface DetailedGrade {
    id: number;
    subject_code: string | null;
    subject_name: string | null;
    school_year: number | null;
    semester: string | null;
    letter_grade: string | null;
    points: number | null;
}

interface Student {
    id: number;
    name: string;
    email: string;
    first_name: string;
    last_name: string;
    semestral_gpa: number | null;
    overall_gpa: number | null;
    detailed_grades: DetailedGrade[];
}

interface StudentsIndexProps {
    students: Student[];
    selectedFirstName?: string;
    selectedLastName?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Students',
        href: '/students',
    },
];

const formatGpa = (value: number | null): string => {
    if (value === null) {
        return 'N/A';
    }

    return value.toFixed(2);
};

export default function StudentsIndex({
    students,
    selectedFirstName = '',
    selectedLastName = '',
}: StudentsIndexProps) {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const { data, setData } = useForm({
        first_name: selectedFirstName,
        last_name: selectedLastName,
    });

    const handleSearch = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        router.get('/students', data, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleReset = (): void => {
        setData({
            first_name: '',
            last_name: '',
        });

        router.get('/students', {
            first_name: '',
            last_name: '',
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleViewDetails = (student: Student): void => {
        setSelectedStudent(student);
        setDetailsOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Students</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Search students and review detailed grades with computed GPA
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
                </form>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>First Name</TableHead>
                                <TableHead>Last Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Semestral GPA</TableHead>
                                <TableHead>Overall GPA</TableHead>
                                <TableHead className="w-20">Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                                        No students found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.first_name}</TableCell>
                                        <TableCell>{student.last_name}</TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>{formatGpa(student.semestral_gpa)}</TableCell>
                                        <TableCell>{formatGpa(student.overall_gpa)}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewDetails(student)}
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

            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{selectedStudent?.name} - Detailed Grades</DialogTitle>
                        <DialogDescription>
                            Semestral GPA: {formatGpa(selectedStudent?.semestral_gpa ?? null)} | Overall GPA: {formatGpa(selectedStudent?.overall_gpa ?? null)}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-96 overflow-y-auto rounded-md border">
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
                                {!selectedStudent || selectedStudent.detailed_grades.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                                            No grades found for this student
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    selectedStudent.detailed_grades.map((grade) => (
                                        <TableRow key={grade.id}>
                                            <TableCell>{grade.subject_code ?? '-'}</TableCell>
                                            <TableCell>{grade.subject_name ?? '-'}</TableCell>
                                            <TableCell>{grade.school_year ?? '-'}</TableCell>
                                            <TableCell>{grade.semester ?? '-'}</TableCell>
                                            <TableCell>{grade.letter_grade ?? '-'}</TableCell>
                                            <TableCell>{grade.points !== null ? grade.points.toFixed(2) : '-'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDetailsOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
