import { useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface UseDataTableOptions<T> {
    data: T[];
    initialSortKey?: string;
    initialSortDir?: SortDirection;
    initialPageSize?: number;
    initialViewMode?: 'table' | 'card';
    searchFields?: Array<keyof T | string | ((item: T) => string | number | null | undefined)>;
    customSort?: Record<string, (a: T, b: T, dir: SortDirection) => number>;
}

export function useDataTable<T extends Record<string, any>>({
    data = [],
    initialSortKey = '',
    initialSortDir = 'asc',
    initialPageSize = 10,
    initialViewMode = 'table',
    searchFields,
    customSort,
}: UseDataTableOptions<T>) {
    const [viewMode, setViewMode] = useState<'table' | 'card'>(initialViewMode);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<string>(initialSortKey);
    const [sortDir, setSortDir] = useState<SortDirection>(initialSortDir);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    // Sort toggle helper
    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
        setCurrentPage(1);
    };

    // Filtered data
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) {
            return data;
        }

        const queryTokens = searchTerm
            .toLowerCase()
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        return data.filter((item) => {
            // Extract all searchable string values
            let targetStrings: string[] = [];

            if (searchFields && searchFields.length > 0) {
                targetStrings = searchFields.map((field) => {
                    if (typeof field === 'function') {
                        const val = field(item);
                        return val !== null && val !== undefined ? String(val).toLowerCase() : '';
                    }
                    const val = item[field as string];
                    return val !== null && val !== undefined ? String(val).toLowerCase() : '';
                });
            } else {
                targetStrings = Object.values(item)
                    .filter((v) => typeof v === 'string' || typeof v === 'number')
                    .map((v) => String(v).toLowerCase());
            }

            const combinedText = targetStrings.join(' ');
            return queryTokens.every((token) => combinedText.includes(token));
        });
    }, [data, searchTerm, searchFields]);

    // Sorted data
    const sortedData = useMemo(() => {
        if (!sortKey) {
            return filteredData;
        }

        const sorted = [...filteredData].sort((a, b) => {
            if (customSort && customSort[sortKey]) {
                return customSort[sortKey](a, b, sortDir);
            }

            const valA = a[sortKey];
            const valB = b[sortKey];

            if (valA === valB) return 0;
            if (valA === null || valA === undefined) return 1;
            if (valB === null || valB === undefined) return -1;

            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDir === 'asc' ? valA - valB : valB - valA;
            }

            const strA = String(valA);
            const strB = String(valB);

            const comparison = strA.localeCompare(strB, 'tr', {
                numeric: true,
                sensitivity: 'base',
            });

            return sortDir === 'asc' ? comparison : -comparison;
        });

        return sorted;
    }, [filteredData, sortKey, sortDir, customSort]);

    // Pagination calculations
    const totalItems = sortedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const effectivePage = Math.min(Math.max(1, currentPage), totalPages);

    const startIndex = totalItems === 0 ? 0 : (effectivePage - 1) * pageSize + 1;
    const endIndex = Math.min(effectivePage * pageSize, totalItems);

    const paginatedData = useMemo(() => {
        const start = (effectivePage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, effectivePage, pageSize]);

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    return {
        viewMode,
        setViewMode,
        searchTerm,
        setSearchTerm: handleSearchChange,
        sortKey,
        sortDir,
        handleSort,
        currentPage: effectivePage,
        setCurrentPage,
        pageSize,
        setPageSize: handlePageSizeChange,
        paginatedData,
        sortedData,
        filteredData,
        totalItems,
        totalPages,
        startIndex,
        endIndex,
    };
}
