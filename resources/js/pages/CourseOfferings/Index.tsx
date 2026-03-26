import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
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

interface SubjectOption {
    id: number;
    name: string;
    code: string | null;
}

interface TeacherOption {
    id: number;
    name: string;
    email: string;
}

interface CourseOffering {
    id: number;
    subject_id: number;
    teacher_id: number;
    is_registered: boolean;
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
}

interface CourseOfferingsIndexProps {
    courseOfferings: CourseOffering[];
    years: number[];
    semesters: string[];
    selectedYear?: string | null;
    selectedSemester?: string | null;
    canManage: boolean;
    studentIdNumber?: number | null;
    subjects: SubjectOption[];
    teachers: TeacherOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Course Offerings',
        href: '/course-offerings',
    },
];

const normalizeTime = (value: string | null): string => {
    if (!value) {
        return '';
    }

    return value.slice(0, 5);
};

export default function CourseOfferingsIndex({
    courseOfferings,
    years,
    semesters,
    selectedYear,
    selectedSemester,
    canManage,
    studentIdNumber,
    subjects,
    teachers,
}: CourseOfferingsIndexProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCourseOffering, setSelectedCourseOffering] = useState<CourseOffering | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [courseOfferingToDelete, setCourseOfferingToDelete] = useState<CourseOffering | null>(null);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [selectedRegistrationCourse, setSelectedRegistrationCourse] = useState<CourseOffering | null>(null);

    const {
        data,
        setData,
        post,
        put,
        reset,
        processing,
        errors,
    } = useForm({
        subject_name: '',
        teacher_id: '',
        day: '',
        room: '',
        start_time: '',
        end_time: '',
        year: '',
        sem: '',
    });

    const {
        data: filterData,
        setData: setFilterData,
    } = useForm({
        year: selectedYear || '',
        semester: selectedSemester || '',
    });

    const {
        data: registrationData,
        setData: setRegistrationData,
        post: postRegistration,
        processing: registrationProcessing,
        errors: registrationErrors,
        reset: resetRegistration,
    } = useForm({
        id_number: '',
    });

    const handleFilterChange = (field: 'year' | 'semester', value: string): void => {
        const updatedValue = value === 'all' ? '' : value;
        const nextFilterData = {
            ...filterData,
            [field]: updatedValue,
        };

        setFilterData(field, updatedValue);

        router.get('/course-offerings', nextFilterData, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleAddCourseOffering = (): void => {
        reset();
        setSelectedCourseOffering(null);
        setIsFormOpen(true);
    };

    const handleEditCourseOffering = (courseOffering: CourseOffering): void => {
        setSelectedCourseOffering(courseOffering);
        setData({
            subject_name: courseOffering.subject.name || '',
            teacher_id: courseOffering.teacher_id?.toString() || '',
            day: courseOffering.day || '',
            room: courseOffering.room || '',
            start_time: normalizeTime(courseOffering.start_time),
            end_time: normalizeTime(courseOffering.end_time),
            year: courseOffering.year?.toString() || '',
            sem: courseOffering.sem || '',
        });
        setIsFormOpen(true);
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (selectedCourseOffering) {
            put(`/course-offerings/${selectedCourseOffering.id}`, {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                },
            });

            return;
        }

        post('/course-offerings', {
            onSuccess: () => {
                setIsFormOpen(false);
                reset();
            },
        });
    };

    const handleDeleteClick = (courseOffering: CourseOffering): void => {
        setCourseOfferingToDelete(courseOffering);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = (): void => {
        if (!courseOfferingToDelete) {
            return;
        }

        router.delete(`/course-offerings/${courseOfferingToDelete.id}`, {
            onFinish: () => {
                setDeleteConfirmOpen(false);
                setCourseOfferingToDelete(null);
            },
        });
    };

    const handleOpenRegistration = (courseOffering: CourseOffering): void => {
        setSelectedRegistrationCourse(courseOffering);
        setRegistrationData('id_number', studentIdNumber ? studentIdNumber.toString() : '');
        setIsRegistrationOpen(true);
    };

    const handleRegistrationSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (!selectedRegistrationCourse) {
            return;
        }

        postRegistration(`/course-offerings/${selectedRegistrationCourse.id}/register`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsRegistrationOpen(false);
                setSelectedRegistrationCourse(null);
                resetRegistration();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Course Offerings" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Course Offerings</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            {canManage
                                ? 'Create, edit, delete, and filter course offerings'
                                : 'View available course offerings and filter by school year'}
                        </p>
                    </div>
                    {canManage ? (
                        <Button onClick={handleAddCourseOffering}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Course Offering
                        </Button>
                    ) : null}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex-1">
                        <Label className="mb-2 block">School Year</Label>
                        <Select
                            value={filterData.year?.toString() || 'all'}
                            onValueChange={(value) => handleFilterChange('year', value || '')}
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

                    {canManage ? (
                        <div className="flex-1">
                            <Label className="mb-2 block">Semester</Label>
                            <Select
                                value={filterData.semester || 'all'}
                                onValueChange={(value) => handleFilterChange('semester', value || '')}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All Semesters" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Semesters</SelectItem>
                                    {semesters.map((semester) => (
                                        <SelectItem key={semester} value={semester}>
                                            {semester}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : null}
                </div>

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
                                <TableHead>School Year</TableHead>
                                <TableHead>Semester</TableHead>
                                {canManage ? <TableHead className="w-24">Actions</TableHead> : <TableHead className="w-32">Registration</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courseOfferings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={canManage ? 9 : 8} className="py-8 text-center text-gray-500">
                                        No course offerings found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courseOfferings.map((courseOffering) => (
                                    <TableRow key={courseOffering.id}>
                                        <TableCell className="font-medium">{courseOffering.subject.code}</TableCell>
                                        <TableCell>{courseOffering.subject.name}</TableCell>
                                        <TableCell>{courseOffering.teacher.name}</TableCell>
                                        <TableCell>{courseOffering.day}</TableCell>
                                        <TableCell>{courseOffering.room}</TableCell>
                                        <TableCell>
                                            {normalizeTime(courseOffering.start_time)} - {normalizeTime(courseOffering.end_time)}
                                        </TableCell>
                                        <TableCell>{courseOffering.year}</TableCell>
                                        <TableCell>{courseOffering.sem}</TableCell>
                                        {canManage ? (
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditCourseOffering(courseOffering)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() => handleDeleteClick(courseOffering)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        ) : (
                                            <TableCell>
                                                {courseOffering.is_registered ? (
                                                    <Button variant="outline" size="sm" disabled>
                                                        Registered
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenRegistration(courseOffering)}
                                                    >
                                                        Register
                                                    </Button>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {canManage ? (
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {selectedCourseOffering ? 'Edit Course Offering' : 'Add Course Offering'}
                            </DialogTitle>
                            <DialogDescription>
                                {selectedCourseOffering
                                    ? 'Update the details of this course offering.'
                                    : 'Create a new course offering.'}
                            </DialogDescription>
                        </DialogHeader>

                        <form className="space-y-4" onSubmit={handleFormSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="subject_name">Subject Name</Label>
                            <Input
                                id="subject_name"
                                value={data.subject_name}
                                onChange={(event) => setData('subject_name', event.target.value)}
                                placeholder="Enter subject name"
                                className={errors.subject_name ? 'border-red-500' : ''}
                            />
                            {errors.subject_name && <p className="text-sm text-red-600">{errors.subject_name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="teacher_id">Teacher</Label>
                            <Select
                                value={data.teacher_id || ''}
                                onValueChange={(value) => setData('teacher_id', value || '')}
                            >
                                <SelectTrigger className={errors.teacher_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                            {teacher.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.teacher_id && <p className="text-sm text-red-600">{errors.teacher_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="day">Day</Label>
                                <Input
                                    id="day"
                                    value={data.day}
                                    onChange={(event) => setData('day', event.target.value)}
                                    className={errors.day ? 'border-red-500' : ''}
                                />
                                {errors.day && <p className="text-sm text-red-600">{errors.day}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="room">Room</Label>
                                <Input
                                    id="room"
                                    value={data.room}
                                    onChange={(event) => setData('room', event.target.value)}
                                    className={errors.room ? 'border-red-500' : ''}
                                />
                                {errors.room && <p className="text-sm text-red-600">{errors.room}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_time">Start Time</Label>
                                <Input
                                    id="start_time"
                                    type="time"
                                    value={data.start_time}
                                    onChange={(event) => setData('start_time', event.target.value)}
                                    className={errors.start_time ? 'border-red-500' : ''}
                                />
                                {errors.start_time && <p className="text-sm text-red-600">{errors.start_time}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_time">End Time</Label>
                                <Input
                                    id="end_time"
                                    type="time"
                                    value={data.end_time}
                                    onChange={(event) => setData('end_time', event.target.value)}
                                    className={errors.end_time ? 'border-red-500' : ''}
                                />
                                {errors.end_time && <p className="text-sm text-red-600">{errors.end_time}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="year">School Year</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    value={data.year}
                                    onChange={(event) => setData('year', event.target.value)}
                                    className={errors.year ? 'border-red-500' : ''}
                                />
                                {errors.year && <p className="text-sm text-red-600">{errors.year}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sem">Semester</Label>
                                <Select value={data.sem || ''} onValueChange={(value) => setData('sem', value || '')}>
                                    <SelectTrigger className={errors.sem ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1ST">1ST</SelectItem>
                                        <SelectItem value="2ND">2ND</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.sem && <p className="text-sm text-red-600">{errors.sem}</p>}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Saving...'
                                    : selectedCourseOffering
                                      ? 'Update Course Offering'
                                      : 'Create Course Offering'}
                            </Button>
                        </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            ) : null}

            {canManage ? (
                <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Course Offering</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this course offering? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleConfirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
                </Dialog>
            ) : null}

            {!canManage ? (
                <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Course Registration</DialogTitle>
                            <DialogDescription>
                                Register for {selectedRegistrationCourse?.subject.code} - {selectedRegistrationCourse?.subject.name} ({selectedRegistrationCourse?.year} / {selectedRegistrationCourse?.sem})
                            </DialogDescription>
                        </DialogHeader>

                        <form className="space-y-4" onSubmit={handleRegistrationSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="id_number">ID Number</Label>
                                <Input
                                    id="id_number"
                                    value={registrationData.id_number}
                                    onChange={(event) => setRegistrationData('id_number', event.target.value)}
                                    placeholder="Enter your ID number"
                                    className={registrationErrors.id_number ? 'border-red-500' : ''}
                                />
                                {registrationErrors.id_number ? (
                                    <p className="text-sm text-red-600">{registrationErrors.id_number}</p>
                                ) : null}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsRegistrationOpen(false)}
                                    disabled={registrationProcessing}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={registrationProcessing}>
                                    {registrationProcessing ? 'Registering...' : 'Confirm Registration'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            ) : null}
        </AppLayout>
    );
}
