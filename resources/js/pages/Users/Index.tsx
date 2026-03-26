import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Edit, Plus } from 'lucide-react';
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

interface ManagedUser {
    id: number;
    name: string;
    email: string;
    role: 'teacher' | 'admin';
}

interface RoleOption {
    value: string;
    label: string;
}

interface UsersIndexProps {
    users: ManagedUser[];
    roles: RoleOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

export default function UsersIndex({ users, roles }: UsersIndexProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: '',
    });

    const handleAddUser = (): void => {
        reset();
        setSelectedUser(null);
        setIsFormOpen(true);
    };

    const handleEditUser = (user: ManagedUser): void => {
        setSelectedUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (selectedUser) {
            put(`/users/${selectedUser.id}`, {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                },
            });

            return;
        }

        post('/users', {
            onSuccess: () => {
                setIsFormOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Add and edit teacher/admin user accounts
                        </p>
                    </div>
                    <Button onClick={handleAddUser}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </div>

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
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 capitalize">
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedUser ? 'Edit User' : 'Add New User'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedUser
                                ? `Update ${selectedUser.name}'s account information`
                                : 'Create a new teacher or admin user account'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(event) => setData('email', event.target.value)}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={data.role} onValueChange={(value) => setData('role', value)}>
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
                            {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Password{' '}
                                {selectedUser && (
                                    <span className="text-gray-500">(leave blank to keep current)</span>
                                )}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : selectedUser ? 'Update User' : 'Add User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
