import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutGrid, Table2 } from 'lucide-react';

interface DataTableViewToggleProps {
    viewMode: 'table' | 'card';
    onViewModeChange: (mode: 'table' | 'card') => void;
    className?: string;
}

export function DataTableViewToggle({
    viewMode,
    onViewModeChange,
    className,
}: DataTableViewToggleProps) {
    return (
        <div
            className={cn(
                'inline-flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5 shadow-2xs',
                className,
            )}
            role="group"
            aria-label="Görünüm Seçenekleri"
        >
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange('table')}
                className={cn(
                    'h-7 px-2.5 text-xs font-medium transition-all gap-1.5 rounded-md',
                    viewMode === 'table'
                        ? 'bg-background text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-transparent',
                )}
                title="Tablo Görünümü (Varsayılan)"
            >
                <Table2 className="h-3.5 w-3.5" />
                <span>Tablo</span>
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange('card')}
                className={cn(
                    'h-7 px-2.5 text-xs font-medium transition-all gap-1.5 rounded-md',
                    viewMode === 'card'
                        ? 'bg-background text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-transparent',
                )}
                title="Kart Görünümü"
            >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Kart</span>
            </Button>
        </div>
    );
}
