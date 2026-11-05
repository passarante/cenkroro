import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false }: { user?: User | null; showEmail?: boolean }) {
    const getInitials = useInitials();

    const name = user?.name || 'Misafir Kullanıcı';
    const email = user?.email || '';
    const avatar = user?.avatar;
    const role = user?.role || 'operation';

    const roleBadge = () => {
        if (!user) return null;
        switch (role) {
            case 'admin':
                return <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-semibold text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 rounded">Yönetici</span>;
            case 'operation':
                return <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 rounded">Operasyon</span>;
            case 'field':
                return <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-semibold text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300 rounded">Saha</span>;
            default:
                return null;
        }
    };

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full shrink-0">
                {avatar && <AvatarImage src={avatar} alt={name} />}
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white text-xs font-bold">
                    {getInitials(name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                <div className="flex items-center gap-1.5 truncate">
                    <span className="truncate font-medium">{name}</span>
                    {roleBadge()}
                </div>
                {showEmail && <span className="text-muted-foreground truncate text-xs">{email}</span>}
            </div>
        </>
    );
}

