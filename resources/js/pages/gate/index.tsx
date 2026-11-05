import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Booking, GateLog } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Camera,
    CheckCircle2,
    Scale,
    ShieldAlert,
    ShieldCheck,
    Truck,
} from 'lucide-react';
import { useDataTable } from '@/hooks/use-data-table';
import {
    DataTableColumnHeader,
    DataTablePagination,
    DataTableSearch,
    DataTableViewToggle,
} from '@/components/data-table';
import { toast } from 'sonner';

interface GateIndexProps {
    bookings: Booking[];
    gateLogs: GateLog[];
    selectedPlate: string;
    selectedBooking?: Booking | null;
    declaredWeight: number;
    measuredWeight: number;
    weightDiff: number;
    isWeightTolerable: boolean;
}

export default function GateIndex({
    bookings = [],
    gateLogs = [],
    selectedPlate = '',
    selectedBooking,
    declaredWeight = 36.0,
    measuredWeight = 36.15,
    weightDiff = 0.15,
    isWeightTolerable = true,
}: GateIndexProps) {
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
    } = useDataTable<GateLog>({
        data: gateLogs,
        initialSortKey: 'id',
        initialSortDir: 'desc',
        initialPageSize: 10,
        searchFields: ['id', 'plate', 'time', 'gateNumber', 'sealNumber', 'driver', 'status'],
    });

    const handlePlateChange = (plate: string) => {
        router.visit(`/gate?plate=${encodeURIComponent(plate)}`, { preserveState: true });
    };

    const gateInForm = useForm({
        bookingId: selectedBooking?.id || '',
        measuredWeight: measuredWeight,
        sealNumber: 'SL-' + Math.floor(10000 + Math.random() * 90000) + 'A',
        gateNumber: 'KAPI-1 (Ana Giriş)',
    });

    const handleApproveGateIn = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBooking) return;

        gateInForm.post('/gate/approve', {
            onSuccess: () => {
                toast.success(`Kapı girişi ve kantar onaylandı: ${selectedBooking.truckPlate} sahaya kabul edildi.`);
                gateInForm.reset();
            },
            onError: () => {
                toast.error('Kapı onayı verilirken hata oluştu.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Kapı & Kantar', href: '/gate' }]}>
            <Head title="Kantar & Terminal Kapı Kontrolü - Cenk Ro-Ro" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Top Gate & Scale Simulation Station */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Left: Araç Tanıma & Plaka Seçimi */}
                    <Card className="p-4 md:p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                                    <Camera className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold">KAPI-1 CANLI KAMERA & OCR</CardTitle>
                                    <CardDescription className="text-xs">
                                        Otomatik Plaka & Bilet Eşleştirme İstasyonu
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-xs">
                                <span className="relative mr-1.5 flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                </span>
                                CANLI KAMERA
                            </Badge>
                        </div>

                        {/* Plate Select Box */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Girişteki Araç / Plaka Seçimi:</Label>
                            <Select
                                value={selectedPlate}
                                onValueChange={handlePlateChange}
                            >
                                <SelectTrigger className="font-mono text-sm font-bold">
                                    <SelectValue placeholder="Plaka seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bookings.map((b) => (
                                        <SelectItem key={b.id} value={b.truckPlate} className="font-mono">
                                            {b.truckPlate} ({b.shipper} - {b.category})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedBooking && (
                            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-mono text-2xl font-black text-foreground">
                                            {selectedBooking.truckPlate}
                                        </div>
                                        <div className="font-mono text-xs text-muted-foreground">
                                            Dorse: {selectedBooking.trailerPlate || 'YOK'}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="font-mono text-blue-500 border-blue-500/30">
                                        {selectedBooking.id}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t">
                                    <div>
                                        <span className="text-muted-foreground">Firma:</span>
                                        <div className="font-semibold text-foreground truncate">{selectedBooking.shipper}</div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Sürücü:</span>
                                        <div className="font-semibold text-foreground truncate">{selectedBooking.driverName || '-'}</div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Beyan Ağırlığı:</span>
                                        <div className="font-mono font-bold text-blue-500 dark:text-blue-400">
                                            {selectedBooking.weightTon} Ton
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Gümrük Hattı:</span>
                                        <div className="font-medium text-foreground">{selectedBooking.customsStatus || 'Beklemede (YNS)'}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Right: Dijital Kantar & Tartım İstasyonu */}
                    <Card className="p-4 md:p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">
                                    <Scale className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold">DİJİTAL KANTAR & TARTIM</CardTitle>
                                    <CardDescription className="text-xs">
                                        Aks Tartım & Otomatik Tolerans Kontrolü
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                AKREDİTE KANTAR
                            </Badge>
                        </div>

                        {/* Weight Indicators */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border bg-muted/20 p-3.5 text-center">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    BEYAN EDİLEN AĞIRLIK
                                </div>
                                <div className="font-mono text-2xl font-black text-foreground mt-0.5">
                                    {declaredWeight}{' '}
                                    <span className="text-xs font-normal text-muted-foreground">Ton</span>
                                </div>
                            </div>

                            <div className="rounded-lg border bg-teal-500/5 border-teal-500/20 p-3.5 text-center">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    KANTAR ÖLÇÜLEN
                                </div>
                                <div className="font-mono text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5">
                                    {measuredWeight}{' '}
                                    <span className="text-xs font-normal text-muted-foreground">Ton</span>
                                </div>
                            </div>
                        </div>

                        {/* Deviation alert */}
                        <div
                            className={`rounded-lg border p-3 text-xs flex items-center justify-between font-medium ${
                                isWeightTolerable
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'border-destructive/30 bg-destructive/10 text-destructive'
                            }`}
                        >
                            <div>
                                Fark (Sapma):{' '}
                                <strong className="font-mono font-bold">
                                    {weightDiff >= 0 ? `+${weightDiff}` : weightDiff} Ton
                                </strong>
                            </div>
                            <div className="flex items-center gap-1 font-bold">
                                {isWeightTolerable ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" /> Tolerans Dahilinde (Maks 1.0 Ton)
                                    </>
                                ) : (
                                    <>
                                        <ShieldAlert className="h-4 w-4" /> Yüksek Sapma / Manuel Kontrol
                                    </>
                                )}
                            </div>
                        </div>

                        {selectedBooking && (
                            <form onSubmit={handleApproveGateIn} className="space-y-3 pt-1">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Güvenlik Mühür No:</Label>
                                        <Input
                                            className="font-mono text-xs"
                                            value={gateInForm.data.sealNumber}
                                            onChange={(e) => gateInForm.setData('sealNumber', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Giriş Kapısı:</Label>
                                        <Select
                                            value={gateInForm.data.gateNumber}
                                            onValueChange={(val) => gateInForm.setData('gateNumber', val)}
                                        >
                                            <SelectTrigger className="text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="KAPI-1 (Ana Giriş)">KAPI-1 (Ana Giriş)</SelectItem>
                                                <SelectItem value="KAPI-2 (ADR Kapısı)">KAPI-2 (ADR Kapısı)</SelectItem>
                                                <SelectItem value="KAPI-3 (VIP / Frigo)">KAPI-3 (VIP / Frigo)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={gateInForm.processing}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 shadow-sm"
                                >
                                    <ShieldCheck className="mr-2 h-5 w-5" />
                                    BARİYERİ AÇ VE SAHAYA KABUL ET (GATE-IN)
                                </Button>
                            </form>
                        )}
                    </Card>
                </div>

                {/* Gate Logs Table & Card View */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-wrap items-center justify-between gap-3 pb-3">
                        <div>
                            <CardTitle className="text-lg">Kantar ve Kapı Geçiş Günlüğü</CardTitle>
                            <CardDescription>
                                Terminal kantarından geçen araçların tescilli ölçüm ve güvenlik mühür kayıtları
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <DataTableSearch
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Plaka, mühür no, sürücü ara..."
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
                                            <DataTableColumnHeader
                                                title="Kayıt ID"
                                                sortKey="id"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Saat"
                                                sortKey="time"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Plaka"
                                                sortKey="plate"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Kapı"
                                                sortKey="gateNumber"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Beyan Tonajı"
                                                sortKey="declaredWeight"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Kantar Ölçümü"
                                                sortKey="kantarWeight"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Fark"
                                                sortKey="variance"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Mühür No"
                                                sortKey="sealNumber"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={requestSort}
                                            />
                                            <DataTableColumnHeader
                                                title="Sürücü"
                                                sortKey="driver"
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
                                                className="justify-end"
                                            />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                                                    Henüz kantar veya kapı geçiş kaydı bulunmamaktadır.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedData.map((log) => (
                                                <TableRow key={log.id} className="hover:bg-muted/40 transition-colors">
                                                    <TableCell className="font-mono font-bold text-blue-500">
                                                        {log.id}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">{log.time}</TableCell>
                                                    <TableCell className="font-mono font-bold">{log.plate}</TableCell>
                                                    <TableCell className="text-xs">{log.gateNumber}</TableCell>
                                                    <TableCell className="font-mono">{log.declaredWeight} ton</TableCell>
                                                    <TableCell className="font-mono font-bold">{log.kantarWeight} ton</TableCell>
                                                    <TableCell className="font-mono text-xs font-semibold text-teal-600 dark:text-teal-400">
                                                        {log.variance}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">{log.sealNumber}</TableCell>
                                                    <TableCell className="text-xs font-medium">{log.driver}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs">
                                                            {log.status}
                                                        </Badge>
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
                                        Arama kriterlerine uygun kantar veya kapı geçiş kaydı bulunamadı.
                                    </div>
                                ) : (
                                    paginatedData.map((log) => (
                                        <Card key={log.id} className="p-4 border-border/70 hover:border-blue-500/40 transition-colors shadow-xs flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div>
                                                        <span className="text-[10px] font-mono text-muted-foreground">{log.id} • {log.time}</span>
                                                        <div className="font-mono text-lg font-black text-foreground">
                                                            {log.plate}
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs">
                                                        {log.status}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-1 text-xs mb-3 text-muted-foreground">
                                                    <div>📍 <span className="text-foreground font-medium">{log.gateNumber}</span></div>
                                                    <div>👤 Sürücü: <span className="text-foreground font-medium">{log.driver}</span></div>
                                                    <div className="font-mono text-[11px]">🔒 Mühür: <span className="text-foreground">{log.sealNumber}</span></div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 text-xs rounded-lg bg-muted/40 p-2.5 mb-2">
                                                    <div>
                                                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Beyan:</span>
                                                        <span className="font-mono font-semibold">{log.declaredWeight} ton</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Ölçüm:</span>
                                                        <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{log.kantarWeight} ton</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t pt-2.5 flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Fark Sapması:</span>
                                                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                                                    {log.variance}
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
