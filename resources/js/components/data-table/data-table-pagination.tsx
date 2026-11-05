import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

interface DataTablePaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    pageSizeOptions?: number[];
    className?: string;
}

export function DataTablePagination({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    startIndex,
    endIndex,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100],
    className,
}: DataTablePaginationProps) {
    // Generate page numbers with smart windowing
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible + 2) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                end = 4;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
            }

            if (start > 2) {
                pages.push('dots-prev');
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) {
                pages.push('dots-next');
            }

            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 border-t border-border/60 text-xs text-muted-foreground',
                className,
            )}
        >
            {/* Left: Range and total */}
            <div className="flex items-center gap-2">
                {totalItems === 0 ? (
                    <span>0 kayıt</span>
                ) : (
                    <span>
                        <strong className="text-foreground font-mono">{startIndex}</strong> -{' '}
                        <strong className="text-foreground font-mono">{endIndex}</strong> arası gösteriliyor (Toplam{' '}
                        <strong className="text-foreground font-mono">{totalItems}</strong> kayıt)
                    </span>
                )}
            </div>

            {/* Right: Page size and controls */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Page Size Selector */}
                <div className="flex items-center gap-1.5">
                    <span className="whitespace-nowrap">Sayfa başına:</span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(val) => onPageSizeChange(Number(val))}
                    >
                        <SelectTrigger className="h-7 w-[68px] text-xs font-mono">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions.map((opt) => (
                                <SelectItem key={opt} value={String(opt)} className="text-xs font-mono">
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage <= 1}
                        className="h-7 w-7 p-0"
                        title="İlk Sayfa"
                    >
                        <ChevronsLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="h-7 w-7 p-0"
                        title="Önceki Sayfa"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>

                    <div className="flex items-center gap-1">
                        {getPageNumbers().map((pageItem, idx) => {
                            if (typeof pageItem === 'string') {
                                return (
                                    <span
                                        key={`dots-${idx}`}
                                        className="px-1 text-muted-foreground/60 select-none font-mono"
                                    >
                                        …
                                    </span>
                                );
                            }

                            const isActive = pageItem === currentPage;
                            return (
                                <Button
                                    key={pageItem}
                                    type="button"
                                    variant={isActive ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onPageChange(pageItem)}
                                    className={cn(
                                        'h-7 min-w-7 px-2 text-xs font-mono transition-all',
                                        isActive
                                            ? 'font-bold shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    {pageItem}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="h-7 w-7 p-0"
                        title="Sonraki Sayfa"
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage >= totalPages}
                        className="h-7 w-7 p-0"
                        title="Son Sayfa"
                    >
                        <ChevronsRight className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
