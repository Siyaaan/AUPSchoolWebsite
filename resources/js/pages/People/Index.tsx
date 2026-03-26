import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Edit, Trash2, Plus } from 'lucide-react';
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { index as peopleIndex } from '@/routes/people';
import type { BreadcrumbItem } from '@/types';

interface Person {
	id: number;
	name: string;
	email: string;
	role: 'teacher' | 'student';
	created_at: string;
}

interface Role {
	value: string;
	label: string;
}

interface PeopleIndexProps {
	people: Person[];
	roles: Role[];
}

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'People',
		href: peopleIndex().url,
	},
];

export default function PeopleIndex({ people, roles }: PeopleIndexProps) {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [personToDelete, setPersonToDelete] = useState<Person | null>(null);

	const { data, setData, post, put, reset, processing, errors } = useForm({
		name: '',
		email: '',
		password: '',
		role: '',
	});

	const handleAddPerson = () => {
		reset();
		setSelectedPerson(null);
		setIsFormOpen(true);
	};

	const handleEditPerson = (person: Person) => {
		setSelectedPerson(person);
		setData({
			name: person.name,
			email: person.email,
			password: '',
			role: person.role,
		});
		setIsFormOpen(true);
	};

	const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (selectedPerson) {
			put(`/people/${selectedPerson.id}`, {
				onSuccess: () => {
					setIsFormOpen(false);
					reset();
				},
			});
		} else {
			post('/people', {
				onSuccess: () => {
					setIsFormOpen(false);
					reset();
				},
			});
		}
	};

	const handleDeleteClick = (person: Person) => {
		setPersonToDelete(person);
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = () => {
		if (personToDelete) {
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = `/people/${personToDelete.id}`;
			form.innerHTML = `
        <input type="hidden" name="_method" value="DELETE">
        <input type="hidden" name="_token" value="${document.querySelector('meta[name=csrf-token]')?.getAttribute('content')}">
      `;
			document.body.appendChild(form);
			form.submit();
		}
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="People" />
			<div className="space-y-6 p-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">People</h1>
						<p className="mt-2 text-sm text-gray-600">
							Manage students and teachers in your school
						</p>
					</div>
					<Button onClick={handleAddPerson}>
						<Plus className="mr-2 h-4 w-4" />
						Add Person
					</Button>
				</div>

				{/* People Table */}
				<div className="rounded-lg border bg-white">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead className="w-20">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{people.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="text-center py-8 text-gray-500">
										No people found.{' '}
										<button
											onClick={handleAddPerson}
											className="text-blue-600 hover:underline"
										>
											Add one
										</button>
									</TableCell>
								</TableRow>
							) : (
								people.map((person) => (
									<TableRow key={person.id}>
										<TableCell className="font-medium">{person.name}</TableCell>
										<TableCell>{person.email}</TableCell>
										<TableCell>
											<span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 capitalize">
												{person.role}
											</span>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEditPerson(person)}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDeleteClick(person)}
													className="text-red-600 hover:text-red-700 hover:bg-red-50"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Form Dialog */}
			<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{selectedPerson ? 'Edit Person' : 'Add New Person'}
						</DialogTitle>
						<DialogDescription>
							{selectedPerson
								? `Update ${selectedPerson.name}'s information`
								: 'Create a new student or teacher account'}
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleFormSubmit} className="space-y-6">
						{/* Name Field */}
						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								type="text"
								placeholder="John Doe"
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
								placeholder="john@example.com"
								value={data.email}
								onChange={(e) => setData('email', e.target.value)}
								className={errors.email ? 'border-red-500' : ''}
							/>
							{errors.email && (
								<p className="text-sm text-red-600">{errors.email}</p>
							)}
						</div>

						{/* Role Field */}
						<div className="space-y-2">
							<Label htmlFor="role">Role</Label>
							<Select
								value={data.role}
								onValueChange={(value) => setData('role', value)}
							>
								<SelectTrigger className={errors.role ? 'border-red-500' : ''}>
									<SelectValue placeholder="Select a role" />
								</SelectTrigger>
								<SelectContent>
									{roles.map((role) => (
										<SelectItem key={role.value} value={role.value}>
											{role.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.role && (
								<p className="text-sm text-red-600">{errors.role}</p>
							)}
						</div>

						{/* Password Field */}
						<div className="space-y-2">
							<Label htmlFor="password">
								Password{' '}
								{selectedPerson && (
									<span className="text-gray-500">
										(leave blank to keep current)
									</span>
								)}
							</Label>
							<Input
								id="password"
								type="password"
								placeholder={
									selectedPerson
										? 'Enter to change password'
										: 'Create a strong password'
								}
								value={data.password}
								onChange={(e) => setData('password', e.target.value)}
								className={errors.password ? 'border-red-500' : ''}
							/>
							{errors.password && (
								<p className="text-sm text-red-600">{errors.password}</p>
							)}
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsFormOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={processing}>
								{processing
									? 'Saving...'
									: selectedPerson
										? 'Update Person'
										: 'Add Person'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Person</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete {personToDelete?.name}? This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setDeleteConfirmOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleConfirmDelete}
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</AppLayout>
	);
}
