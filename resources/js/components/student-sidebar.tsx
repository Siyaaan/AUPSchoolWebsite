import { Link } from '@inertiajs/react';
import {
    Home,
    BookMarked,
    BarChart3,
    Settings,
    UserPlus,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: dashboard(),
        icon: Home,
    },
    {
        title: 'Register for Courses',
        href: '/register-courses',
        icon: UserPlus,
    },
    {
        title: 'My Courses',
        href: '/my-courses',
        icon: BookMarked,
    },
    {
        title: 'Grades',
        href: '/my-grades',
        icon: BarChart3,
    },
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: Settings,
    },
];

export function StudentSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
