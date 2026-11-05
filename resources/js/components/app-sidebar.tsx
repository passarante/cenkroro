import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
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
    Globe 
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Operasyon Masası',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Seferler & Filo',
        url: '/voyages',
        icon: Ship,
    },
    {
        title: 'Rezervasyon Masası',
        url: '/bookings',
        icon: Ticket,
    },
    {
        title: 'İstif Planı (Güverte)',
        url: '/stowage',
        icon: Layers,
    },
    {
        title: 'Gümrük & Manifesto',
        url: '/customs',
        icon: ShieldCheck,
    },
    {
        title: 'Kapı & Kantar Girişi',
        url: '/gate',
        icon: Scale,
    },
    {
        title: 'Acenteler & Cari Risk',
        url: '/forwarders',
        icon: Building2,
    },
    {
        title: 'Tarifeler & Kategoriler',
        url: '/tariffs',
        icon: Tag,
    },
    {
        title: 'Acente & Sürücü Portalı',
        url: '/portal',
        icon: Smartphone,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Karşılama Sayfası',
        url: '/',
        icon: Globe,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
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
