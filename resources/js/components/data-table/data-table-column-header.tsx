import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import React from 'react';

interface DataTableColumnHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
    title: React.ReactNode;
    sortKey?: string;
    currentSortKey?: string;
    currentSortDir?: 'asc' | 'desc';
    onSort?: (key: string) => void;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

export function DataTableColumnHeader({
    title,
    sortKey,
    currentSortKey,
    currentSortDir,
    onSort,
    align = 'left',
    className,
    children,
    ...props
}: DataTableColumnHeaderProps) {
    const isSortable = !!sortKey && !!onSort;
    const isSorted = isSortable && currentSortKey === sortKey;

    const alignClass =
        align === 'right'
            ? 'justify-end text-right'
            : align === 'center'
              ? 'justify-center text-center'
              : 'justify-start text-left';

    return (
        <TableHead className={cn('select-none whitespace-nowrap', className)} {...props}>
            {isSortable ? (
                <button
                    type="button"
                    onClick={() => onSort(sortKey)}
                    className={cn(
                        'flex items-center gap-1.5 py-1 text-xs font-semibold tracking-wide transition-colors hover:text-foreground focus-visible:outline-hidden group cursor-pointer w-full',
                        alignClass,
                        isSorted ? 'text-primary dark:text-blue-400 font-bold' : 'text-muted-foreground',
                    )}
                >
                    <span>{title}</span>
                    <span
                        className={cn(
                            'flex h-4 w-4 items-center justify-center rounded transition-opacity',
                            isSorted ? 'opacity-100 text-primary dark:text-blue-400' : 'opacity-40 group-hover:opacity-80',
                        )}
                    >
                        {isSorted ? (
                            currentSortDir === 'desc' ? (
                                <ArrowDown className="h-3.5 w-3.5 stroke-[2.5]" />
                            ) : (
                                <ArrowUp className="h-3.5 w-3.5 stroke-[2.5]" />
                            )
                        ) : (
                            <ArrowUpDown className="h-3 w-3" />
                        )}
                    </span>
                </button>
            ) : (
                <div className={cn('text-xs font-semibold tracking-wide text-muted-foreground', alignClass)}>
                    {title}
                </div>
            )}
        </TableHead>
    );
}
