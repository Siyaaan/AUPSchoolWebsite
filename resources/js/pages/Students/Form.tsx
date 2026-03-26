import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Student {
	id: number;
	name: string;
	email: string;
}

interface StudentFormProps {
	student?: Student;
}

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Students',
		href: '/students',
	},
];

export default function StudentForm({ student }: StudentFormProps) {
	const isEdit = !!student;

	const { data, setData, put, post, processing, errors } = useForm({
		name: student?.name || '',
		email: student?.email || '',
		password: '',
	});

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (isEdit && student) {
			put(`/students/${student.id}`, {
				onSuccess: () => {
					// Redirect handled by Laravel
				},
			});

			return;
		}

		post('/students');
	};

	return (
		<AppLayout breadcrumbs={[...breadcrumbs, { title: isEdit ? 'Edit' : 'Add', href: '#' }]}>
			<Head title={isEdit ? 'Edit Student' : 'Add Student'} />
			<div className="space-y-6 p-4">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/students">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							{isEdit ? 'Edit Student' : 'Add New Student'}
						</h1>
						<p className="mt-1 text-sm text-gray-600">
							{isEdit
								? `Update ${student?.name}'s information`
								: 'Create a new student account'}
						</p>
					</div>
				</div>

				<form className="rounded-lg border bg-white p-6 max-w-2xl" onSubmit={handleSubmit}>
					<div className="space-y-6">
						{/* Name Field */}
						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								type="text"
								placeholder="Jane Smith"
								value={data.name}
								onChange={(e) => setData('name', e.target.value)}
								className={errors.name ? 'border-red-500' : ''}
							/>
							{errors.name && (
								<p className="text-sm text-red-600">{errors.name}</p>
							)}
						</div>

						{/* Email Field */}
						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								placeholder="jane@example.com"
								value={data.email}
								onChange={(e) => setData('email', e.target.value)}
								className={errors.email ? 'border-red-500' : ''}
							/>
							{errors.email && (
								<p className="text-sm text-red-600">{errors.email}</p>
							)}
						</div>

						{!isEdit && (
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									placeholder="At least 8 characters"
									value={data.password}
									onChange={(e) => setData('password', e.target.value)}
									className={errors.password ? 'border-red-500' : ''}
								/>
								{errors.password && (
									<p className="text-sm text-red-600">{errors.password}</p>
								)}
							</div>
						)}

						{/* Form Actions */}
						<div className="flex gap-4 border-t pt-6">
							<Button type="submit" disabled={processing}>
								{processing ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Student'}
							</Button>
							<Button variant="outline" asChild>
								<Link href="/students">Cancel</Link>
							</Button>
						</div>
					</div>
				</form>
			</div>
		</AppLayout>
	);
}
