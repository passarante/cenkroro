import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import React from 'react';

interface DataTableSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function DataTableSearch({
    value,
    onChange,
    placeholder = 'Tabloda ara...',
    className,
}: DataTableSearchProps) {
    return (
        <div className={cn('relative flex items-center', className)}>
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-8 pl-8 pr-7 text-xs bg-background/80 focus-visible:ring-1"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-full"
                    title="Aramayı Temizle"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}
