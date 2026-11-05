import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutGrid, 
    Ship, 
    Ticket, 
    Layers, 
    ShieldCheck, 
    Scale, 
    Building2, 
    Tag, 
    Smartphone, 
    Globe,
    Users 
} from 'lucide-react';
import React from 'react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Karşılama Sayfası',
        url: '/',
        icon: Globe,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    const mainNavItems = React.useMemo(() => {
        if (!user) {
            return [
                { title: 'Operasyon Masası', url: '/dashboard', icon: LayoutGrid },
                { title: 'Seferler & Filo', url: '/voyages', icon: Ship },
                { title: 'Rezervasyon Masası', url: '/bookings', icon: Ticket },
                { title: 'İstif Planı (Güverte)', url: '/stowage', icon: Layers },
                { title: 'Gümrük & Manifesto', url: '/customs', icon: ShieldCheck },
                { title: 'Kapı & Kantar Girişi', url: '/gate', icon: Scale },
                { title: 'Acenteler & Cari Risk', url: '/forwarders', icon: Building2 },
                { title: 'Tarifeler & Kategoriler', url: '/tariffs', icon: Tag },
                { title: 'Acente & Sürücü Portalı', url: '/portal', icon: Smartphone },
            ];
        }

        // Saha Kullanıcısı Navigasyonu
        if (user.role === 'field') {
            return [
                {
                    title: 'Rezervasyon Portalı',
                    url: '/portal',
                    icon: Smartphone,
                },
                {
                    title: 'Aktif Seferler',
                    url: '/portal?tab=schedule',
                    icon: Ship,
                },
                {
                    title: 'Geçmiş İşlemlerim',
                    url: '/portal?tab=history',
                    icon: Ticket,
                },
            ];
        }

        const items: NavItem[] = [];
        const perms = (user.permissions_json as string[]) || [];
        const isAdmin = user.role === 'admin';
        const hasAllDefault = !isAdmin && perms.length === 0;

        // 1. Operasyon Masası
        if (isAdmin || perms.includes('dashboard') || hasAllDefault) {
            items.push({ title: 'Operasyon Masası', url: '/dashboard', icon: LayoutGrid });
        }

        // 2. Seferler & Filo
        if (isAdmin || perms.includes('voyages') || hasAllDefault) {
            items.push({ title: 'Seferler & Filo', url: '/voyages', icon: Ship });
        }

        // 3. Rezervasyon Masası
        if (isAdmin || perms.includes('bookings') || hasAllDefault) {
            items.push({ title: 'Rezervasyon Masası', url: '/bookings', icon: Ticket });
        }

        // 4. İstif Planı (Güverte)
        if (isAdmin || perms.includes('stowage')) {
            items.push({ title: 'İstif Planı (Güverte)', url: '/stowage', icon: Layers });
        }

        // 5. Gümrük & Manifesto
        if (isAdmin || perms.includes('customs')) {
            items.push({ title: 'Gümrük & Manifesto', url: '/customs', icon: ShieldCheck });
        }

        // 6. Kapı & Kantar Girişi
        if (isAdmin || perms.includes('gate') || hasAllDefault) {
            items.push({ title: 'Kapı & Kantar Girişi', url: '/gate', icon: Scale });
        }

        // 7. Acenteler & Cari Risk
        if (isAdmin || perms.includes('forwarders')) {
            items.push({ title: 'Acenteler & Cari Risk', url: '/forwarders', icon: Building2 });
        }

        // 8. Tarifeler & Kategoriler
        if (isAdmin || perms.includes('tariffs')) {
            items.push({ title: 'Tarifeler & Kategoriler', url: '/tariffs', icon: Tag });
        }

        // 9. Acente & Sürücü Portalı
        if (isAdmin || perms.includes('portal') || hasAllDefault) {
            items.push({ title: 'Acente & Sürücü Portalı', url: '/portal', icon: Smartphone });
        }

        // 10. Kullanıcı & Yetki Yönetimi (Yalnızca Yönetici)
        if (isAdmin) {
            items.push({ title: 'Kullanıcı & Yetki Yönetimi', url: '/users', icon: Users });
        }

        return items;
    }, [user]);

    const homeUrl = user?.role === 'field' ? '/portal' : '/dashboard';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeUrl} prefetch>
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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
