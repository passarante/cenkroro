import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false }: { user?: User | null; showEmail?: boolean }) {
    const getInitials = useInitials();

    const name = user?.name || 'Operasyon Yetkilisi';
    const email = user?.email || 'operasyon@cenkroro.com';
    const avatar = user?.avatar;

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                {avatar && <AvatarImage src={avatar} alt={name} />}
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                {showEmail && <span className="text-muted-foreground truncate text-xs">{email}</span>}
            </div>
        </>
    );
}

