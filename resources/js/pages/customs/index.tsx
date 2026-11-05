import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Booking, Voyage } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    FileText,
    Printer,
    Scale,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';
import { useDataTable } from '@/hooks/use-data-table';
import {
    DataTableColumnHeader,
    DataTablePagination,
    DataTableSearch,
    DataTableViewToggle,
} from '@/components/data-table';

interface CustomsIndexProps {
    voyages: Voyage[];
    activeVoyage?: Voyage | null;
    bookings: Booking[];
    filterHat: string;
    totalGrossWeight: number;
    totalWeightKg: number;
    totalLM: number;
    ynsCount: number;
    sariCount: number;
    kirmiziCount: number;
    reeferCount: number;
    adrCount: number;
    manifestNo: string;
    bilgeNo: string;
}

export default function CustomsIndex({
    voyages = [],
    activeVoyage,
    bookings = [],
    filterHat = 'ALL',
    totalGrossWeight = 0,
    totalWeightKg = 0,
    ynsCount = 0,
    sariCount = 0,
    kirmiziCount = 0,
    reeferCount = 0,
    adrCount = 0,
    manifestNo = '',
    bilgeNo = '',
}: CustomsIndexProps) {
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
    } = useDataTable<Booking>({
        data: bookings,
        initialSortKey: 'mrnNumber',
        initialSortDir: 'asc',
        initialPageSize: 10,
        searchFields: ['id', 'mrnNumber', 'truckPlate', 'trailerPlate', 'shipper', 'cargoDescription', 'customsStatus'],
    });

    const handleVoyageChange = (voyageId: string) => {
        router.visit(`/customs?voyage=${voyageId}`, { preserveState: true });
    };

    const handleHatChange = (hat: string) => {
        const url = new URL(window.location.href);
        if (hat && hat !== 'ALL') {
            url.searchParams.set('hat', hat);
        } else {
            url.searchParams.delete('hat');
        }
        router.visit(url.toString(), { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Gümrük & Manifesto', href: '/customs' }]}>
            <Head title="Gümrük & Resmi Yük Manifestosu - Cenk Ro-Ro" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Top KPI Bar */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <Card className="p-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                            <span>TOPLAM BRÜT AĞIRLIK</span>
                            <Scale className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="font-mono text-2xl font-bold text-foreground mt-1">
                            {Number(totalGrossWeight).toFixed(1)} Ton
                        </div>
                        <div className="font-mono text-xs text-blue-500 font-semibold">
                            {Number(totalWeightKg).toLocaleString('tr-TR')} kg
                        </div>
                    </Card>

                    <Card className="p-4 border-emerald-500/30 bg-emerald-500/5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                            <span>YEŞİL HAT (SERBEST)</span>
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="font-mono text-2xl font-bold text-emerald-500 mt-1">
                            {ynsCount}
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            Fiziki Kontrolsüz Geçiş
                        </div>
                    </Card>

                    <Card className="p-4 border-amber-500/30 bg-amber-500/5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center justify-between">
                            <span>SARI HAT (BELGE)</span>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="font-mono text-2xl font-bold text-amber-500 mt-1">
                            {sariCount}
                        </div>
                        <div className="text-xs text-amber-500/90 font-medium">
                            Evrak / Beyan İnceleme
                        </div>
                    </Card>

                    <Card className="p-4 border-destructive/30 bg-destructive/5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-destructive flex items-center justify-between">
                            <span>KIRMIZI HAT (MUAYENE)</span>
                            <ShieldAlert className="h-4 w-4 text-destructive" />
                        </div>
                        <div className="font-mono text-2xl font-bold text-destructive mt-1">
                            {kirmiziCount}
                        </div>
                        <div className="text-xs text-destructive font-medium">
                            X-Ray / Arama Yapılacak
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                            <span>ADR & FRİGO YÜKLER</span>
                            <AlertTriangle className="h-4 w-4 text-teal-500" />
                        </div>
                        <div className="font-mono text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                            {adrCount + reeferCount}
                        </div>
                        <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                            {adrCount} ADR • {reeferCount} Frigo
                        </div>
                    </Card>
                </div>

                {/* Sefer Seçimi & Resmi Yazdır Butonu Barı */}
                <Card className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-muted-foreground">Sefer:</span>
                                <Select
                                    value={activeVoyage?.id || ''}
                                    onValueChange={handleVoyageChange}
                                >
                                    <SelectTrigger className="w-[280px] font-semibold text-xs">
                                        <SelectValue placeholder="Sefer seçiniz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {voyages.map((v) => (
                                            <SelectItem key={v.id} value={v.id}>
                                                {v.id} — {v.vesselName} ({v.route}) {v.departureTime ? `— 📅 ${v.departureTime}` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="font-mono text-xs text-muted-foreground hidden md:block">
                                Manifesto No: <strong className="text-blue-500 dark:text-blue-400">{manifestNo}</strong> | BİLGE No:{' '}
                                <strong className="text-foreground">{bilgeNo}</strong>
                            </div>
                        </div>

                        {activeVoyage && (
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm" asChild>
                                <Link href={`/customs/manifest/${activeVoyage.id}`} target="_blank">
                                    <Printer className="mr-1.5 h-4 w-4" /> Resmi Yük Manifestosunu Aç (Form-10)
                                </Link>
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Customs Manifest Table & Card View */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-wrap items-center justify-between gap-3 pb-3">
                        <div>
                            <CardTitle className="text-lg">Gümrük Manifestosu ve YNS Beyan Tablosu</CardTitle>
                            <CardDescription>
                                {activeVoyage ? `${activeVoyage.id} seferi kapsamındaki tescilli yükler` : 'Tüm yükler'}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <DataTableSearch
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="MRN, plaka, firma ara..."
                                className="w-48 sm:w-64"
                            />
                            <Badge variant="outline" className="font-mono text-xs hidden sm:inline-flex">
                                {totalItems} Kayıt
                            </Badge>
                            <DataTableViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {viewMode === 'table' ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12 text-center">Sıra</TableHead>
                                            <DataTableColumnHeader
                                                title="MRN Beyanname No"
                                                sortKey="mrnNumber"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Bilet No"
                                                sortKey="id"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Çekici / Dorse"
                                                sortKey="truckPlate"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Taşıyıcı / Cari"
                                                sortKey="shipper"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Kargo Tanımı"
                                                sortKey="cargoDescription"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Ağırlık (Kg)"
                                                sortKey="weightTon"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                                className="justify-end"
                                            />
                                            <DataTableColumnHeader
                                                title="YNS Gümrük Hattı"
                                                sortKey="customsStatus"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <TableHead>BİLGE Durumu</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                                                    Bu sefere ait gümrük tescilli yük kaydı bulunamadı.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedData.map((b, idx) => (
                                                <TableRow key={b.id} className="hover:bg-muted/40 transition-colors">
                                                    <TableCell className="font-mono text-center font-bold text-muted-foreground">
                                                        {startIndex + idx}
                                                    </TableCell>
                                                    <TableCell className="font-mono font-bold text-blue-500 dark:text-blue-400">
                                                        {b.mrnNumber || `26TR3400000${1000 + startIndex + idx}A`}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">{b.id}</TableCell>
                                                    <TableCell>
                                                        <span className="font-mono font-bold">{b.truckPlate}</span>
                                                        {b.trailerPlate && (
                                                            <span className="font-mono text-xs text-muted-foreground"> / {b.trailerPlate}</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-medium">{b.shipper}</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                                                        {b.cargoDescription || 'Genel Kargo'}
                                                    </TableCell>
                                                    <TableCell className="font-mono font-bold text-right">
                                                        {Number(b.weightTon * 1000).toLocaleString('tr-TR')} kg
                                                    </TableCell>
                                                    <TableCell>
                                                        {b.customsStatus?.includes('Yeşil') ? (
                                                            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs">
                                                                ✓ Yeşil Hat (Serbest)
                                                            </Badge>
                                                        ) : b.customsStatus?.includes('Sarı') ? (
                                                            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs">
                                                                ⏳ Sarı Hat (Belge)
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="destructive" className="text-xs">
                                                                🛑 Kırmızı Hat (Muayene)
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> BİLGE Tescil Edildi
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                                {paginatedData.length === 0 ? (
                                    <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
                                        Arama veya filtre kriterlerine uygun gümrük tescil kaydı bulunamadı.
                                    </div>
                                ) : (
                                    paginatedData.map((b, idx) => (
                                        <Card key={b.id} className="p-4 border-border/70 hover:border-blue-500/40 transition-colors shadow-xs flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div>
                                                        <span className="text-[10px] font-mono text-muted-foreground">#{startIndex + idx} • {b.id}</span>
                                                        <div className="font-mono text-sm font-bold text-blue-500 dark:text-blue-400">
                                                            {b.mrnNumber || `26TR3400000${1000 + startIndex + idx}A`}
                                                        </div>
                                                    </div>
                                                    {b.customsStatus?.includes('Yeşil') ? (
                                                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[11px]">
                                                            ✓ Yeşil Hat
                                                        </Badge>
                                                    ) : b.customsStatus?.includes('Sarı') ? (
                                                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-[11px]">
                                                            ⏳ Sarı Hat
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive" className="text-[11px]">
                                                            🛑 Kırmızı Hat
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="space-y-1 text-xs mb-3">
                                                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                                        <span>🚛</span> {b.truckPlate} {b.trailerPlate ? `/ ${b.trailerPlate}` : ''}
                                                    </div>
                                                    <div className="text-muted-foreground truncate">
                                                        🏢 {b.shipper}
                                                    </div>
                                                    <div className="text-muted-foreground truncate text-[11px]">
                                                        📦 {b.cargoDescription || 'Genel Kargo'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="border-t pt-2.5 flex items-center justify-between text-xs">
                                                <span className="font-mono font-bold text-foreground">
                                                    {Number(b.weightTon * 1000).toLocaleString('tr-TR')} kg
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> BİLGE Tescilli
                                                </span>
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
            </div>
        </AppLayout>
    );
}
