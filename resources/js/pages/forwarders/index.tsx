import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Forwarder } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    BadgePercent,
    Building2,
    CheckCircle2,
    Edit2,
    Lock,
    Plus,
    Search,
    Trash2,
    Unlock,
} from 'lucide-react';
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
import { useState } from 'react';
import { toast } from 'sonner';

interface ForwardersIndexProps {
    forwarders: Forwarder[];
    search: string;
    riskFilter: string;
    totalLimitEur: number;
    totalBalanceEur: number;
    blockedCount: number;
}

export default function ForwardersIndex({
    forwarders = [],
    search = '',
    riskFilter = 'ALL',
    totalLimitEur = 0,
    totalBalanceEur = 0,
    blockedCount = 0,
}: ForwardersIndexProps) {
    const [isNewForwarderOpen, setIsNewForwarderOpen] = useState(false);
    const [editingForwarder, setEditingForwarder] = useState<Forwarder | null>(null);

    const {
        viewMode,
        setViewMode,
        searchTerm,
        setSearchTerm,
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
    } = useDataTable<Forwarder>({
        data: forwarders,
        initialSortKey: 'name',
        initialSortDir: 'asc',
        initialPageSize: 10,
        searchFields: ['id', 'name', 'code', 'taxOffice', 'taxNumber', 'contactPerson', 'phone', 'email', 'status', 'rating'],
    });

    const handleFilterChange = (key: string, value: string) => {
        const url = new URL(window.location.href);
        if (value && value !== 'ALL') {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
        router.visit(url.toString(), { preserveState: true });
    };

    // New Forwarder Form
    const newForwarderForm = useForm({
        name: '',
        code: '',
        country: 'Türkiye',
        city: 'İstanbul',
        taxOffice: '',
        taxNumber: '',
        creditLimitEur: 100000,
        contactPerson: '',
        phone: '+90 216 ',
        email: '',
        rating: 'A+',
    });

    const handleCreateForwarder = (e: React.FormEvent) => {
        e.preventDefault();
        newForwarderForm.post('/forwarders/store', {
            onSuccess: () => {
                toast.success('Yeni lojistik firması başarıyla eklendi.');
                setIsNewForwarderOpen(false);
                newForwarderForm.reset();
            },
            onError: () => toast.error('Lütfen zorunlu alanları kontrol ediniz.'),
        });
    };

    // Edit Forwarder Form
    const editForwarderForm = useForm({
        name: '',
        code: '',
        taxOffice: '',
        taxNumber: '',
        creditLimitEur: 0,
        currentBalanceEur: 0,
        contactPerson: '',
        phone: '',
        email: '',
        status: 'Aktif',
    });

    const openEditForwarder = (f: Forwarder) => {
        setEditingForwarder(f);
        editForwarderForm.setData({
            name: f.name,
            code: f.code || '',
            taxOffice: f.taxOffice || '',
            taxNumber: f.taxNumber || '',
            creditLimitEur: f.creditLimitEur,
            currentBalanceEur: f.currentBalanceEur,
            contactPerson: f.contactPerson || '',
            phone: f.phone || '',
            email: f.email || '',
            status: f.status,
        });
    };

    const handleUpdateForwarder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingForwarder) return;
        editForwarderForm.post(`/forwarders/update/${editingForwarder.id}`, {
            onSuccess: () => {
                toast.success('Firma cari bilgileri güncellendi.');
                setEditingForwarder(null);
            },
        });
    };

    const handleToggleBlock = (id: string) => {
        router.post(`/forwarders/toggle-block/${id}`, {}, {
            onSuccess: () => toast.info('Firma blokaj / risk durumu güncellendi.'),
        });
    };

    const handleDeleteForwarder = (f: Forwarder) => {
        if (!confirm(`[${f.name}] cari kartını silmek istediğinize emin misiniz?`)) return;
        router.post(`/forwarders/destroy/${f.id}`, {}, {
            onSuccess: () => toast.success('Firma kaydı silindi.'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Acenteler & Cari Risk', href: '/forwarders' }]}>
            <Head title="Firma & Cari Risk Yönetimi - Cenk Ro-Ro" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Top KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="p-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            TOPLAM CARİ LİMİTİ
                        </div>
                        <div className="font-mono text-2xl font-bold text-foreground mt-1">
                            €{Number(totalLimitEur).toLocaleString('tr-TR')}
                        </div>
                        <div className="text-xs text-blue-500 font-medium">Tahsis Edilen Açık Kredi</div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            KULLANILAN BAKİYE
                        </div>
                        <div className="font-mono text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                            €{Number(totalBalanceEur).toLocaleString('tr-TR')}
                        </div>
                        <div className="text-xs text-teal-500 font-medium">Açık Hesap Navlun Borcu</div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            BLOKE / ASKIYA ALINAN
                        </div>
                        <div
                            className={`font-mono text-2xl font-bold mt-1 ${
                                blockedCount > 0 ? 'text-destructive' : 'text-emerald-500'
                            }`}
                        >
                            {blockedCount} Firma
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">Rezervasyon Açmaya Kapalı</div>
                    </Card>
                </div>

                {/* Filter and Action Bar */}
                <Card className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl">
                            <DataTableSearch
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Firma adı, cari kod, vergi no ara..."
                                className="w-full sm:w-72"
                            />

                            <Select
                                value={riskFilter}
                                onValueChange={(val) => handleFilterChange('risk', val)}
                            >
                                <SelectTrigger className="w-[180px] text-xs">
                                    <SelectValue placeholder="Tüm Cariler" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tüm Cariler</SelectItem>
                                    <SelectItem value="LIMIT_EXCEEDED">⚠️ Limiti Aşanlar</SelectItem>
                                    <SelectItem value="BLOCKED">🛑 Blokeli Cariler</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-3">
                            <DataTableViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                            <Button
                                onClick={() => setIsNewForwarderOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                size="sm"
                            >
                                <Plus className="mr-1.5 h-4 w-4" /> Yeni Firma / Cari Ekle
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Main Content: Table or Card View */}
                {viewMode === 'table' ? (
                    <Card className="overflow-hidden border border-border shadow-sm">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <DataTableColumnHeader
                                            title="Cari Kod"
                                            sortKey="code"
                                            currentSortKey={sortKey}
                                            currentSortDir={sortDir}
                                            onSort={requestSort}
                                        />
                                        <DataTableColumnHeader
                                            title="Firma Ünvanı"
                                            sortKey="name"
                                            currentSortKey={sortKey}
                                            currentSortDir={sortDir}
                                            onSort={requestSort}
                                        />
                                        <DataTableColumnHeader
                                            title="Skor"
                                            sortKey="rating"
                                            currentSortKey={sortKey}
                                            currentSortDir={sortDir}
                                            onSort={requestSort}
                                        />
                                        <DataTableColumnHeader
                                            title="Vergi Dairesi / No"
                                            sortKey="taxNumber"
                                            currentSortKey={sortKey}
                                            currentSortDir={sortDir}
                                            onSort={requestSort}
                                        />
                                        <DataTableColumnHeader
                                            title="Yetkili / İletişim"
                                            sortKey="contactPerson"
                                            currentSortKey={sortKey}
                                            currentSortDir={sortDir}
                                            onSort={requestSort}
                                        />
                                        <DataTableColumnHeader
                                            title="Kullanılan Bakiye"
                                            sortKey="currentBalanceEur"
                                            currentSortKey={sortKey}
                                            currentSortDir={sortDir}
                                            onSort={requestSort}
                                        />
                                        <DataTableColumnHeader
                                            title="Kredi Limiti"
                                            sortKey="creditLimitEur"
                                            currentSortKey={sortKey}
                                            currentSortDir={sortDir}
                                            onSort={requestSort}
                                        />
                                        <TableHead>Risk Oranı</TableHead>
                                        <DataTableColumnHeader
                                            title="Durum"
                                            sortKey="status"
                                            currentSortKey={sortKey}
                                            currentSortDir={sortDir}
                                            onSort={requestSort}
                                        />
                                        <TableHead className="text-right">İşlemler</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                                                Arama kriterlerine uygun lojistik firması bulunamadı.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map((f) => {
                                            const limit = f.creditLimitEur > 0 ? f.creditLimitEur : 1;
                                            const pct = Math.round((f.currentBalanceEur / limit) * 100);
                                            const isBlocked = f.status?.includes('Bloke') || f.status?.includes('Askı');
                                            return (
                                                <TableRow key={f.id} className="hover:bg-muted/40 transition-colors">
                                                    <TableCell className="font-mono text-xs font-semibold">
                                                        {f.code || f.id}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-semibold text-foreground">{f.name}</div>
                                                        <div className="text-xs text-muted-foreground">{f.country || 'Türkiye'} - {f.city || 'İstanbul'}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                                                            {f.rating || 'A+'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        <div className="text-muted-foreground">{f.taxOffice || 'Belirtilmedi'}</div>
                                                        <div className="font-mono font-medium">{f.taxNumber || '-'}</div>
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        <div className="font-medium text-foreground">{f.contactPerson || '-'}</div>
                                                        <div className="text-muted-foreground">{f.phone || f.email || '-'}</div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm font-semibold text-teal-600 dark:text-teal-400">
                                                        €{Number(f.currentBalanceEur).toLocaleString('tr-TR')}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm text-foreground">
                                                        €{Number(f.creditLimitEur).toLocaleString('tr-TR')}
                                                    </TableCell>
                                                    <TableCell className="w-[140px]">
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-[11px] font-mono">
                                                                <span className={pct > 90 ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                                                                    %{pct}
                                                                </span>
                                                            </div>
                                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                                                <div
                                                                    className={`h-full rounded-full ${
                                                                        pct > 90
                                                                            ? 'bg-destructive'
                                                                            : 'bg-gradient-to-r from-blue-500 to-teal-400'
                                                                    }`}
                                                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                isBlocked
                                                                    ? 'border-destructive/40 bg-destructive/10 text-destructive text-[11px]'
                                                                    : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-[11px]'
                                                            }
                                                        >
                                                            {f.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className={`h-8 px-2 text-xs ${
                                                                    isBlocked
                                                                        ? 'text-emerald-600 hover:bg-emerald-500/10'
                                                                        : 'text-amber-600 hover:bg-amber-500/10'
                                                                }`}
                                                                title={isBlocked ? 'Blokeyi Kaldır' : 'Cariyi Bloke Et'}
                                                                onClick={() => handleToggleBlock(f.id)}
                                                            >
                                                                {isBlocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 px-2"
                                                                title="Düzenle"
                                                                onClick={() => openEditForwarder(f)}
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 px-2 text-destructive hover:bg-destructive/10"
                                                                title="Sil"
                                                                onClick={() => handleDeleteForwarder(f)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {paginatedData.length === 0 ? (
                            <Card className="col-span-full p-8 text-center text-muted-foreground">
                                Arama kriterlerine uygun kayıtlı lojistik firması bulunamadı.
                            </Card>
                        ) : (
                            paginatedData.map((f) => {
                                const limit = f.creditLimitEur > 0 ? f.creditLimitEur : 1;
                                const pct = Math.round((f.currentBalanceEur / limit) * 100);
                                const isBlocked = f.status?.includes('Bloke') || f.status?.includes('Askı');

                                return (
                                    <Card key={f.id} className="flex flex-col justify-between overflow-hidden shadow-sm hover:border-blue-500/40 transition-colors">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {f.code || f.id}
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                isBlocked
                                                                    ? 'border-destructive/40 bg-destructive/10 text-destructive text-[11px]'
                                                                    : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-[11px]'
                                                            }
                                                        >
                                                            {f.status}
                                                        </Badge>
                                                    </div>
                                                    <CardTitle className="text-lg">{f.name}</CardTitle>
                                                </div>
                                                <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-1 rounded">
                                                    {f.rating || 'A+'}
                                                </span>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4 pt-0">
                                            <div className="text-xs text-muted-foreground space-y-1">
                                                <div>
                                                    🏛️ {f.taxOffice || 'Vergi Dairesi Yok'} •{' '}
                                                    <strong className="font-mono text-foreground">{f.taxNumber || 'V.No Yok'}</strong>
                                                </div>
                                                <div>
                                                    👤 {f.contactPerson || 'İletişim Kişisi Belirtilmedi'} ({f.phone || '-'})
                                                </div>
                                            </div>

                                            {/* Credit Limit Usage Bar */}
                                            <div className="rounded-lg bg-muted/40 p-3 space-y-2">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-muted-foreground text-[11px]">CARİ RİSK / LİMİT:</span>
                                                    <span
                                                        className={`font-mono font-bold ${
                                                            pct > 90 ? 'text-destructive' : 'text-blue-500'
                                                        }`}
                                                    >
                                                        €{Number(f.currentBalanceEur).toLocaleString('tr-TR')} / €
                                                        {Number(f.creditLimitEur).toLocaleString('tr-TR')} (%{pct})
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            pct > 90
                                                                ? 'bg-gradient-to-r from-amber-500 to-destructive'
                                                                : 'bg-gradient-to-r from-blue-500 to-teal-400'
                                                        }`}
                                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between border-t pt-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={`text-xs ${
                                                        isBlocked
                                                            ? 'text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30'
                                                            : 'text-amber-600 hover:bg-amber-500/10 border-amber-500/30'
                                                    }`}
                                                    onClick={() => handleToggleBlock(f.id)}
                                                >
                                                    {isBlocked ? (
                                                        <>
                                                            <Unlock className="mr-1 h-3.5 w-3.5" /> Blokeyi Kaldır
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock className="mr-1 h-3.5 w-3.5" /> Cariyi Bloke Et
                                                        </>
                                                    )}
                                                </Button>

                                                <div className="flex gap-1.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditForwarder(f)}
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" /> Düzenle
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeleteForwarder(f)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Pagination */}
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

            {/* MODALS */}
            {/* New Forwarder Dialog */}
            <Dialog open={isNewForwarderOpen} onOpenChange={setIsNewForwarderOpen}>
                <DialogContent className="max-w-2xl sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Yeni Firma / Cari Kartı Aç</DialogTitle>
                        <DialogDescription>
                            Sisteme tescilli lojistik firması veya acente cari kartı oluşturun.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateForwarder} className="space-y-3.5">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2 space-y-1.5">
                                <Label>Firma Ticari Ünvanı *</Label>
                                <Input
                                    placeholder="Örn: Ekol Lojistik A.Ş."
                                    value={newForwarderForm.data.name}
                                    onChange={(e) => newForwarderForm.setData('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Cari Kodu</Label>
                                <Input
                                    placeholder="EKOL-01"
                                    value={newForwarderForm.data.code}
                                    onChange={(e) => newForwarderForm.setData('code', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Vergi Dairesi</Label>
                                <Input
                                    value={newForwarderForm.data.taxOffice}
                                    onChange={(e) => newForwarderForm.setData('taxOffice', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Vergi Numarası</Label>
                                <Input
                                    value={newForwarderForm.data.taxNumber}
                                    onChange={(e) => newForwarderForm.setData('taxNumber', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Kredi Limiti (€) *</Label>
                                <Input
                                    type="number"
                                    value={newForwarderForm.data.creditLimitEur}
                                    onChange={(e) => newForwarderForm.setData('creditLimitEur', parseFloat(e.target.value) || 0)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Risk Skoru</Label>
                                <Select
                                    value={newForwarderForm.data.rating}
                                    onValueChange={(val) => newForwarderForm.setData('rating', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AAA">AAA (Kusursuz)</SelectItem>
                                        <SelectItem value="A+">A+ (Mükemmel)</SelectItem>
                                        <SelectItem value="A">A (Güvenilir)</SelectItem>
                                        <SelectItem value="B">B (Standart)</SelectItem>
                                        <SelectItem value="C">C (Riskli / Teminatlı)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Yetkili Kişi</Label>
                                <Input
                                    value={newForwarderForm.data.contactPerson}
                                    onChange={(e) => newForwarderForm.setData('contactPerson', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Telefon</Label>
                                <Input
                                    value={newForwarderForm.data.phone}
                                    onChange={(e) => newForwarderForm.setData('phone', e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsNewForwarderOpen(false)}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={newForwarderForm.processing} className="bg-blue-600 hover:bg-blue-700">
                                {newForwarderForm.processing ? 'Kaydediliyor...' : 'Cariyi Aç'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Forwarder Dialog */}
            <Dialog open={!!editingForwarder} onOpenChange={(open) => !open && setEditingForwarder(null)}>
                <DialogContent className="max-w-2xl sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Cari Bilgilerini Düzenle ({editingForwarder?.name})</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateForwarder} className="space-y-3.5">
                        <div className="space-y-1.5">
                            <Label>Firma Ünvanı</Label>
                            <Input
                                value={editForwarderForm.data.name}
                                onChange={(e) => editForwarderForm.setData('name', e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Vergi Dairesi</Label>
                                <Input
                                    value={editForwarderForm.data.taxOffice}
                                    onChange={(e) => editForwarderForm.setData('taxOffice', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Vergi No</Label>
                                <Input
                                    value={editForwarderForm.data.taxNumber}
                                    onChange={(e) => editForwarderForm.setData('taxNumber', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Kredi Limiti (€)</Label>
                                <Input
                                    type="number"
                                    value={editForwarderForm.data.creditLimitEur}
                                    onChange={(e) => editForwarderForm.setData('creditLimitEur', parseFloat(e.target.value) || 0)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Cari Durumu</Label>
                                <Select
                                    value={editForwarderForm.data.status}
                                    onValueChange={(val) => editForwarderForm.setData('status', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Aktif">Aktif</SelectItem>
                                        <SelectItem value="Askıda (Limit Aşımı)">Askıda (Limit Aşımı)</SelectItem>
                                        <SelectItem value="Bloke (Borçlu)">Bloke (Borçlu)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>İletişim Kişisi</Label>
                                <Input
                                    value={editForwarderForm.data.contactPerson}
                                    onChange={(e) => editForwarderForm.setData('contactPerson', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Telefon</Label>
                                <Input
                                    value={editForwarderForm.data.phone}
                                    onChange={(e) => editForwarderForm.setData('phone', e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setEditingForwarder(null)}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={editForwarderForm.processing} className="bg-blue-600 hover:bg-blue-700">
                                {editForwarderForm.processing ? 'Kaydediliyor...' : 'Güncelle'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
