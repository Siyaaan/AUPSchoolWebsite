'use client';

import { usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import TeacherLayout from '@/layouts/teacher-layout';
import StudentLayout from '@/layouts/student-layout';
import type { AppLayoutProps } from '@/types';

export default function AppLayout({
    children,
    breadcrumbs,
    ...props
}: AppLayoutProps) {
    const { auth } = usePage().props;
    const userRole = auth?.user?.role;

    // Select layout based on user role
    const LayoutComponent = (() => {
        switch (userRole) {
            case 'admin':
                return AdminLayout;
            case 'teacher':
                return TeacherLayout;
            case 'student':
                return StudentLayout;
            default:
                return AdminLayout; // Default to admin layout
        }
    })();

    return (
        <LayoutComponent breadcrumbs={breadcrumbs} {...props}>
            {children}
        </LayoutComponent>
    );
}
