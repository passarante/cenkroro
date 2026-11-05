import { Anchor } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md shadow-sm">
                <Anchor className="size-5" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-bold tracking-tight text-blue-900 dark:text-blue-400">CENK RO-RO</span>
                <span className="text-[10px] text-muted-foreground truncate leading-none">Operasyon Masası</span>
            </div>
        </>
    );
}
