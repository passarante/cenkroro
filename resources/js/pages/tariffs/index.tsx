import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Category, Port, Tariff } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    DollarSign,
    Edit2,
    Filter,
    Plus,
    Search,
    Snowflake,
    Tag,
    Trash2,
    Truck,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useDataTable } from '@/hooks/use-data-table';
import {
    DataTableColumnHeader,
    DataTablePagination,
    DataTableSearch,
    DataTableViewToggle,
} from '@/components/data-table';

interface TariffsProps {
    tariffs: Tariff[];
    categories: Category[];
    ports: Port[];
    categoryFilter: string;
    search: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Fiyat Tarifeleri & Kategoriler', href: '/tariffs' },
];

export default function TariffsIndex({
    tariffs = [],
    categories = [],
    ports = [],
    categoryFilter = 'ALL',
    search = '',
}: TariffsProps) {
    const [searchTerm, setSearchTerm] = useState(search);
    const [selectedCatFilter, setSelectedCatFilter] = useState(categoryFilter);

    const {
        viewMode,
        setViewMode,
        searchTerm: tableSearch,
        setSearchTerm: setTableSearch,
        sortKey,
        sortDir,
        requestSort,
        paginatedData,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalPages,
        totalItems,
        startIndex,
        endIndex,
    } = useDataTable<Tariff>({
        data: tariffs,
        initialSortKey: 'id',
        initialSortDir: 'asc',
        initialPageSize: 10,
        searchFields: ['id', 'category', 'categoryDescription', 'route', 'basePriceUsd', 'currency', 'status', 'notes'],
    });

    // Dialog States
    const [newTariffOpen, setNewTariffOpen] = useState(false);
    const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);

    const [newCategoryOpen, setNewCategoryOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Filter handling
    const handleFilterApply = (cat: string, query: string) => {
        router.get(
            '/tariffs',
            { category: cat, search: query },
            { preserveState: true, replace: true }
        );
    };

    // Forms
    const newTariffForm = useForm({
        category: categories[0]?.name || '',
        categoryDescription: '',
        route: 'Pendik (İstanbul) ➔ Trieste (İtalya)',
        currency: 'EUR',
        basePriceUsd: 1650,
        validFrom: new Date().toISOString().split('T')[0],
        validTo: '2026-12-31',
        status: 'Aktif',
        reeferSurchargeUsd: 150,
        adrSurchargeUsd: 120,
        maxGrossWeightTon: 40,
        maxLengthMeters: 16.5,
        notes: '',
    });

    const editTariffForm = useForm({
        category: '',
        categoryDescription: '',
        route: '',
        currency: 'EUR',
        basePriceUsd: 0,
        validFrom: '',
        validTo: '',
        status: 'Aktif',
        notes: '',
    });

    const newCategoryForm = useForm({
        icon: '🚚',
        name: '',
        desc: '',
        defaultLengthM: 16.5,
        defaultMaxWeightTon: 40.0,
        isReeferCapable: false,
        isAdrCapable: false,
    });

    const editCategoryForm = useForm({
        icon: '🚚',
        name: '',
        desc: '',
        defaultLengthM: 16.5,
        defaultMaxWeightTon: 40.0,
        isReeferCapable: false,
        isAdrCapable: false,
    });

    // Submissions
    const handleCreateTariff = (e: React.FormEvent) => {
        e.preventDefault();
        newTariffForm.post('/tariffs', {
            onSuccess: () => {
                setNewTariffOpen(false);
                newTariffForm.reset();
                toast.success('Navlun tarifesi başarıyla kaydedildi.');
            },
            onError: () => {
                toast.error('Tarife kaydedilirken hata oluştu.');
            },
        });
    };

    const handleUpdateTariff = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTariff) return;
        editTariffForm.post(`/tariffs/update/${editingTariff.id}`, {
            onSuccess: () => {
                setEditingTariff(null);
                toast.success('Tarife başarıyla güncellendi.');
            },
            onError: () => {
                toast.error('Tarife güncellenirken hata oluştu.');
            },
        });
    };

    const handleDeleteTariff = (tariff: Tariff) => {
        if (!confirm(`[${tariff.id}] nolu tarifeyi silmek istediğinize emin misiniz?`)) return;
        router.post(`/tariffs/destroy/${tariff.id}`, {}, {
            onSuccess: () => toast.success('Tarife silindi.'),
            onError: () => toast.error('Tarife silinirken hata oluştu.'),
        });
    };

    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        newCategoryForm.post('/tariffs/category/store', {
            onSuccess: () => {
                setNewCategoryOpen(false);
                newCategoryForm.reset();
                toast.success('Araç kategorisi başarıyla eklendi.');
            },
            onError: () => {
                toast.error('Kategori eklenirken hata oluştu.');
            },
        });
    };

    const handleUpdateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;
        editCategoryForm.post(`/tariffs/category/update/${editingCategory.id}`, {
            onSuccess: () => {
                setEditingCategory(null);
                toast.success('Kategori güncellendi.');
            },
            onError: () => {
                toast.error('Kategori güncellenirken hata oluştu.');
            },
        });
    };

    const handleDeleteCategory = (cat: Category) => {
        if (!confirm(`'${cat.name}' kategorisini silmek istediğinize emin misiniz?`)) return;
        router.post(`/tariffs/category/destroy/${cat.id}`, {}, {
            onSuccess: () => toast.success('Kategori silindi.'),
            onError: () => toast.error('Kategori silinemedi.'),
        });
    };

    // Quick calculations for KPIs
    const totalTariffsCount = tariffs.length;
    const activeTariffsCount = tariffs.filter((t) => t.status === 'Aktif').length;
    const avgBasePrice =
        totalTariffsCount > 0
            ? Math.round(tariffs.reduce((acc, t) => acc + (Number(t.basePriceUsd) || 0), 0) / totalTariffsCount)
            : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tarife & Fiyat Listesi - Cenk Ro-Ro" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header Actions & Filter */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-card/60 p-5 shadow-xs backdrop-blur-md">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        <div className="relative min-w-[280px] max-w-md flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rota, kategori veya tarife kodu ara..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    handleFilterApply(selectedCatFilter, e.target.value);
                                }}
                                className="pl-9 bg-background/80"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <select
                                value={selectedCatFilter}
                                onChange={(e) => {
                                    setSelectedCatFilter(e.target.value);
                                    handleFilterApply(e.target.value, searchTerm);
                                }}
                                className="h-9 rounded-md border border-input bg-background/80 px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="ALL">Tüm Kategoriler</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.name}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setNewTariffOpen(true)}
                            className="bg-primary hover:bg-primary/90 font-semibold"
                        >
                            <Plus className="mr-1.5 h-4 w-4" /> Yeni Tarife Ekle
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setNewCategoryOpen(true)}
                            className="border-primary/30 text-primary hover:bg-primary/10"
                        >
                            <Truck className="mr-1.5 h-4 w-4" /> Yeni Kategori
                        </Button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-border/60 bg-card/50 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Toplam Tarife
                            </CardTitle>
                            <Tag className="h-4 w-4 text-sky-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="font-mono text-2xl font-bold">{totalTariffsCount} Adet</div>
                            <p className="text-xs text-muted-foreground mt-1">Tanımlı navlun kuralları</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-card/50 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Aktif Hat Tarifeleri
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="font-mono text-2xl font-bold text-emerald-500">
                                {activeTariffsCount} Aktif
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Satışa açık fiyatlar</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-card/50 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Ortalama Taban Navlun
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="font-mono text-2xl font-bold text-amber-500">
                                €{avgBasePrice.toLocaleString('tr-TR')}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Standart TIR bazında</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-card/50 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Tanımlı Araç Tipleri
                            </CardTitle>
                            <Truck className="h-4 w-4 text-cyan-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="font-mono text-2xl font-bold">{categories.length} Tip</div>
                            <p className="text-xs text-muted-foreground mt-1">Dorse ve çekici sınıfları</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tariffs Table & Card View */}
                <Card className="border-border/60 bg-card/50 shadow-xs overflow-hidden">
                    <CardHeader className="border-b border-border/50 pb-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-lg font-bold">
                                    Güncel Navlun ve Hizmet Tarifeleri
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Hatlar bazında geçerli araç navlun fiyatları ve ek sürşarjlar
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <DataTableSearch
                                    value={tableSearch}
                                    onChange={setTableSearch}
                                    placeholder="Tarife içi ara..."
                                    className="w-48 sm:w-60"
                                />
                                <Badge variant="outline" className="border-sky-500/30 text-sky-400 font-mono hidden sm:inline-flex">
                                    {totalItems} Kayıt
                                </Badge>
                                <DataTableViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {viewMode === 'table' ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <DataTableColumnHeader
                                                title="Tarife Kodu"
                                                sortKey="id"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Araç Kategorisi"
                                                sortKey="category"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Güzergah / Hat"
                                                sortKey="route"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Taban Navlun"
                                                sortKey="basePriceUsd"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Frigo Ek Bedel"
                                                sortKey="reeferSurchargeUsd"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="ADR Ek Bedel"
                                                sortKey="adrSurchargeUsd"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Geçerlilik"
                                                sortKey="validFrom"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Durum"
                                                sortKey="status"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <TableHead className="text-right font-semibold">İşlemler</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedData.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={9}
                                                    className="py-12 text-center text-sm text-muted-foreground"
                                                >
                                                    Seçili filtre veya aramaya uygun navlun tarifesi bulunamadı.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedData.map((t) => (
                                                <TableRow key={t.id} className="hover:bg-muted/40 transition-colors">
                                                    <TableCell className="font-mono font-bold text-sky-400">
                                                        {t.id}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-semibold text-foreground">
                                                            {t.category}
                                                        </div>
                                                        {t.categoryDescription && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {t.categoryDescription}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-foreground">
                                                        {t.route}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-base font-bold text-emerald-400">
                                                        {t.currency === 'EUR' ? '€' : '$'}
                                                        {Number(t.basePriceUsd).toLocaleString('tr-TR')}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        +€{Number(t.reeferSurchargeUsd || 0).toLocaleString('tr-TR')}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        +€{Number(t.adrSurchargeUsd || 0).toLocaleString('tr-TR')}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {t.validFrom} — {t.validTo}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                t.status === 'Aktif'
                                                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                                                    : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                                            }
                                                        >
                                                            {t.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="inline-flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setEditingTariff(t);
                                                                    editTariffForm.setData({
                                                                        category: t.category,
                                                                        categoryDescription: t.categoryDescription || '',
                                                                        route: t.route || '',
                                                                        currency: t.currency || 'EUR',
                                                                        basePriceUsd: t.basePriceUsd,
                                                                        validFrom: t.validFrom || '',
                                                                        validTo: t.validTo || '',
                                                                        status: t.status,
                                                                        notes: t.notes || '',
                                                                    });
                                                                }}
                                                                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5 mr-1" /> Düzenle
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteTariff(t)}
                                                                className="h-8 w-8 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                                {paginatedData.length === 0 ? (
                                    <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
                                        Seçili filtre veya aramaya uygun navlun tarifesi bulunamadı.
                                    </div>
                                ) : (
                                    paginatedData.map((t) => (
                                        <Card key={t.id} className="flex flex-col justify-between border-border/70 hover:border-sky-500/40 transition-all p-5 shadow-xs">
                                            <div>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                                                            {t.id}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                t.status === 'Aktif'
                                                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                                                    : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                                            }
                                                        >
                                                            {t.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="font-mono text-xl font-bold text-emerald-400">
                                                        {t.currency === 'EUR' ? '€' : '$'}{Number(t.basePriceUsd).toLocaleString('tr-TR')}
                                                    </div>
                                                </div>
                                                <div className="font-bold text-base text-foreground mb-1">
                                                    {t.category}
                                                </div>
                                                {t.categoryDescription && (
                                                    <div className="text-xs text-muted-foreground mb-3">
                                                        {t.categoryDescription}
                                                    </div>
                                                )}
                                                <div className="text-xs text-foreground/90 font-medium mb-3 flex items-center gap-1.5">
                                                    <span className="text-muted-foreground">Güzergah:</span> {t.route}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs rounded-lg bg-muted/40 p-2.5 mb-2">
                                                    <div>
                                                        <span className="text-muted-foreground block text-[11px]">Frigo Sürşarj:</span>
                                                        <span className="font-mono font-semibold">+€{Number(t.reeferSurchargeUsd || 0).toLocaleString('tr-TR')}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block text-[11px]">ADR Sürşarj:</span>
                                                        <span className="font-mono font-semibold">+€{Number(t.adrSurchargeUsd || 0).toLocaleString('tr-TR')}</span>
                                                    </div>
                                                    <div className="col-span-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
                                                        Geçerlilik: <span className="font-mono text-foreground">{t.validFrom} — {t.validTo}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end gap-1.5 border-t border-border/50 pt-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingTariff(t);
                                                        editTariffForm.setData({
                                                            category: t.category,
                                                            categoryDescription: t.categoryDescription || '',
                                                            route: t.route || '',
                                                            currency: t.currency || 'EUR',
                                                            basePriceUsd: t.basePriceUsd,
                                                            validFrom: t.validFrom || '',
                                                            validTo: t.validTo || '',
                                                            status: t.status,
                                                            notes: t.notes || '',
                                                        });
                                                    }}
                                                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5 mr-1" /> Düzenle
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteTariff(t)}
                                                    className="h-8 w-8 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        )}
                        <div className="p-4 border-t border-border/50">
                            <DataTablePagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                pageSize={pageSize}
                                totalItems={totalItems}
                                startIndex={startIndex}
                                endIndex={endIndex}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={setPageSize}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Vehicle Categories Grid */}
                <Card className="border-border/60 bg-card/50 shadow-xs">
                    <CardHeader className="border-b border-border/50 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Araç Kategori Tanımları</CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Sistemde kullanılan standart araç tipleri ve varsayılan boy/ağırlık sınırları
                                </p>
                            </div>
                            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 font-mono">
                                {categories.length} Kategori
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="group flex flex-col justify-between rounded-lg border border-border/70 bg-background/50 p-4 transition-all hover:border-sky-500/40 hover:shadow-md"
                                >
                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{cat.icon || '🚚'}</span>
                                                <Badge variant="outline" className="font-mono text-xs border-sky-400/30 text-sky-400">
                                                    {cat.id}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingCategory(cat);
                                                        editCategoryForm.setData({
                                                            icon: cat.icon || '🚚',
                                                            name: cat.name,
                                                            desc: cat.desc || '',
                                                            defaultLengthM: cat.defaultLengthM,
                                                            defaultMaxWeightTon: cat.defaultMaxWeightTon,
                                                            isReeferCapable: Boolean(cat.isReeferCapable),
                                                            isAdrCapable: Boolean(cat.isAdrCapable),
                                                        });
                                                    }}
                                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteCategory(cat)}
                                                    className="h-7 w-7 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        <h4 className="font-bold text-sm text-foreground mb-1">
                                            {cat.name}
                                        </h4>
                                        <p className="text-xs text-muted-foreground min-h-[32px] mb-3">
                                            {cat.desc || 'Açıklama belirtilmemiş.'}
                                        </p>

                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {cat.isReeferCapable && (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]"
                                                >
                                                    <Snowflake className="h-3 w-3 mr-1" /> Frigo Uyumlu
                                                </Badge>
                                            )}
                                            {cat.isAdrCapable && (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]"
                                                >
                                                    <AlertTriangle className="h-3 w-3 mr-1" /> ADR / Tehlikeli
                                                </Badge>
                                            )}
                                            {!cat.isReeferCapable && !cat.isAdrCapable && (
                                                <Badge variant="outline" className="text-muted-foreground text-[10px]">
                                                    Standart Kuru Yük
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
                                        <span>
                                            Boy:{' '}
                                            <strong className="font-mono text-sky-400">
                                                {cat.defaultLengthM}m
                                            </strong>
                                        </span>
                                        <span>
                                            Maks:{' '}
                                            <strong className="font-mono text-emerald-400">
                                                {cat.defaultMaxWeightTon} Ton
                                            </strong>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ================= MODALS ================= */}

            {/* 1. New Tariff Dialog */}
            <Dialog open={newTariffOpen} onOpenChange={setNewTariffOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-sky-400" /> Yeni Navlun Tarifesi Ekle
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCreateTariff} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Araç Kategorisi *</Label>
                                <select
                                    value={newTariffForm.data.category}
                                    onChange={(e) => newTariffForm.setData('category', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                    required
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Güzergah / Hat *</Label>
                                <select
                                    value={newTariffForm.data.route}
                                    onChange={(e) => newTariffForm.setData('route', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                    required
                                >
                                    <option value="Pendik (İstanbul) ➔ Trieste (İtalya)">
                                        Pendik (İstanbul) ➔ Trieste (İtalya)
                                    </option>
                                    <option value="Yalova ➔ Sète (Fransa)">
                                        Yalova ➔ Sète (Fransa)
                                    </option>
                                    <option value="Çeşme (İzmir) ➔ Trieste (İtalya)">
                                        Çeşme (İzmir) ➔ Trieste (İtalya)
                                    </option>
                                    <option value="Mersin ➔ Taranto (İtalya)">
                                        Mersin ➔ Taranto (İtalya)
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Para Birimi</Label>
                                <select
                                    value={newTariffForm.data.currency}
                                    onChange={(e) => newTariffForm.setData('currency', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                >
                                    <option value="EUR">EUR (€)</option>
                                    <option value="USD">USD ($)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Taban Fiyat *</Label>
                                <Input
                                    type="number"
                                    step="10"
                                    value={newTariffForm.data.basePriceUsd}
                                    onChange={(e) => newTariffForm.setData('basePriceUsd', parseFloat(e.target.value) || 0)}
                                    className="font-mono"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Durum</Label>
                                <select
                                    value={newTariffForm.data.status}
                                    onChange={(e) => newTariffForm.setData('status', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Gelecek Dönem">Gelecek Dönem</option>
                                    <option value="Askıda">Askıda</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Geçerlilik Başlangıç</Label>
                                <Input
                                    type="date"
                                    value={newTariffForm.data.validFrom}
                                    onChange={(e) => newTariffForm.setData('validFrom', e.target.value)}
                                    className="font-mono"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Geçerlilik Bitiş</Label>
                                <Input
                                    type="date"
                                    value={newTariffForm.data.validTo}
                                    onChange={(e) => newTariffForm.setData('validTo', e.target.value)}
                                    className="font-mono"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Frigo Sürşarj Bedeli (€)</Label>
                                <Input
                                    type="number"
                                    value={newTariffForm.data.reeferSurchargeUsd}
                                    onChange={(e) => newTariffForm.setData('reeferSurchargeUsd', parseFloat(e.target.value) || 0)}
                                    className="font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>ADR Tehlikeli Madde Bedeli (€)</Label>
                                <Input
                                    type="number"
                                    value={newTariffForm.data.adrSurchargeUsd}
                                    onChange={(e) => newTariffForm.setData('adrSurchargeUsd', parseFloat(e.target.value) || 0)}
                                    className="font-mono"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-border/60">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setNewTariffOpen(false)}
                            >
                                İptal
                            </Button>
                            <Button type="submit" disabled={newTariffForm.processing}>
                                {newTariffForm.processing ? 'Kaydediliyor...' : 'Tarifeyi Kaydet'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 2. Edit Tariff Dialog */}
            <Dialog open={editingTariff !== null} onOpenChange={(open) => !open && setEditingTariff(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit2 className="h-5 w-5 text-sky-400" /> Tarife Bilgilerini Düzenle [{editingTariff?.id}]
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleUpdateTariff} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Kategori *</Label>
                                <Input
                                    value={editTariffForm.data.category}
                                    onChange={(e) => editTariffForm.setData('category', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Güzergah *</Label>
                                <Input
                                    value={editTariffForm.data.route}
                                    onChange={(e) => editTariffForm.setData('route', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Para Birimi</Label>
                                <Input
                                    value={editTariffForm.data.currency}
                                    onChange={(e) => editTariffForm.setData('currency', e.target.value)}
                                    className="font-mono"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Taban Fiyat *</Label>
                                <Input
                                    type="number"
                                    step="10"
                                    value={editTariffForm.data.basePriceUsd}
                                    onChange={(e) => editTariffForm.setData('basePriceUsd', parseFloat(e.target.value) || 0)}
                                    className="font-mono"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Durum</Label>
                                <select
                                    value={editTariffForm.data.status}
                                    onChange={(e) => editTariffForm.setData('status', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Gelecek Dönem">Gelecek Dönem</option>
                                    <option value="Süresi Doldu">Süresi Doldu</option>
                                    <option value="Askıda">Askıda</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Geçerlilik Başlangıç</Label>
                                <Input
                                    type="date"
                                    value={editTariffForm.data.validFrom}
                                    onChange={(e) => editTariffForm.setData('validFrom', e.target.value)}
                                    className="font-mono"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Geçerlilik Bitiş</Label>
                                <Input
                                    type="date"
                                    value={editTariffForm.data.validTo}
                                    onChange={(e) => editTariffForm.setData('validTo', e.target.value)}
                                    className="font-mono"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-border/60">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingTariff(null)}
                            >
                                İptal
                            </Button>
                            <Button type="submit" disabled={editTariffForm.processing}>
                                {editTariffForm.processing ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 3. New Category Dialog */}
            <Dialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-sky-400" /> Yeni Araç Kategori Tanımı
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCreateCategory} className="space-y-4">
                        <div className="grid grid-cols-[80px_1fr] gap-3">
                            <div className="space-y-2">
                                <Label>İkon</Label>
                                <Input
                                    value={newCategoryForm.data.icon}
                                    onChange={(e) => newCategoryForm.setData('icon', e.target.value)}
                                    className="text-center text-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Kategori Adı *</Label>
                                <Input
                                    placeholder="Örn: Frigo Kamyon"
                                    value={newCategoryForm.data.name}
                                    onChange={(e) => newCategoryForm.setData('name', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Açıklama</Label>
                            <Input
                                placeholder="Teknik tanım ve kullanım alanı"
                                value={newCategoryForm.data.desc}
                                onChange={(e) => newCategoryForm.setData('desc', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Standart Boy (Metre) *</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={newCategoryForm.data.defaultLengthM}
                                    onChange={(e) => newCategoryForm.setData('defaultLengthM', parseFloat(e.target.value) || 0)}
                                    className="font-mono"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Maks. Ağırlık (Ton) *</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={newCategoryForm.data.defaultMaxWeightTon}
                                    onChange={(e) => newCategoryForm.setData('defaultMaxWeightTon', parseFloat(e.target.value) || 0)}
                                    className="font-mono"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 rounded-lg border border-border/70 p-3 bg-muted/20">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="new-reefer"
                                    checked={newCategoryForm.data.isReeferCapable}
                                    onCheckedChange={(checked) => newCategoryForm.setData('isReeferCapable', !!checked)}
                                />
                                <Label htmlFor="new-reefer" className="text-xs font-medium cursor-pointer">
                                    ❄️ Frigo Elektrik Desteği
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 pt-1">
                                <Checkbox
                                    id="new-adr"
                                    checked={newCategoryForm.data.isAdrCapable}
                                    onCheckedChange={(checked) => newCategoryForm.setData('isAdrCapable', !!checked)}
                                />
                                <Label htmlFor="new-adr" className="text-xs font-medium cursor-pointer">
                                    ⚠️ ADR / Tehlikeli Madde İzni
                                </Label>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-border/60">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setNewCategoryOpen(false)}
                            >
                                İptal
                            </Button>
                            <Button type="submit" disabled={newCategoryForm.processing}>
                                {newCategoryForm.processing ? 'Ekleniyor...' : 'Kategoriyi Ekle'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 4. Edit Category Dialog */}
            <Dialog open={editingCategory !== null} onOpenChange={(open) => !open && setEditingCategory(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit2 className="h-5 w-5 text-sky-400" /> Araç Kategorisi Düzenle [{editingCategory?.id}]
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleUpdateCategory} className="space-y-4">
                        <div className="grid grid-cols-[80px_1fr] gap-3">
                            <div className="space-y-2">
                                <Label>İkon</Label>
                                <Input
                                    value={editCategoryForm.data.icon}
                                    onChange={(e) => editCategoryForm.setData('icon', e.target.value)}
                                    className="text-center text-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Kategori Adı *</Label>
                                <Input
                                    value={editCategoryForm.data.name}
                                    onChange={(e) => editCategoryForm.setData('name', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Açıklama</Label>
                            <Input
                                value={editCategoryForm.data.desc}
                                onChange={(e) => editCategoryForm.setData('desc', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Standart Boy (Metre) *</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={editCategoryForm.data.defaultLengthM}
                                    onChange={(e) => editCategoryForm.setData('defaultLengthM', parseFloat(e.target.value) || 0)}
                                    className="font-mono"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Maks. Ağırlık (Ton) *</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={editCategoryForm.data.defaultMaxWeightTon}
                                    onChange={(e) => editCategoryForm.setData('defaultMaxWeightTon', parseFloat(e.target.value) || 0)}
                                    className="font-mono"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 rounded-lg border border-border/70 p-3 bg-muted/20">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-reefer"
                                    checked={editCategoryForm.data.isReeferCapable}
                                    onCheckedChange={(checked) => editCategoryForm.setData('isReeferCapable', !!checked)}
                                />
                                <Label htmlFor="edit-reefer" className="text-xs font-medium cursor-pointer">
                                    ❄️ Frigo Elektrik Desteği
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 pt-1">
                                <Checkbox
                                    id="edit-adr"
                                    checked={editCategoryForm.data.isAdrCapable}
                                    onCheckedChange={(checked) => editCategoryForm.setData('isAdrCapable', !!checked)}
                                />
                                <Label htmlFor="edit-adr" className="text-xs font-medium cursor-pointer">
                                    ⚠️ ADR / Tehlikeli Madde İzni
                                </Label>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-border/60">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingCategory(null)}
                            >
                                İptal
                            </Button>
                            <Button type="submit" disabled={editCategoryForm.processing}>
                                {editCategoryForm.processing ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
