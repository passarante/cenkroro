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
    DialogTrigger,
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Booking, Forwarder, Vessel, Voyage } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Anchor,
    ArrowRight,
    BadgeDollarSign,
    Layers,
    Lock,
    Plus,
    Printer,
    Ship,
    Truck,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DashboardProps {
    voyages: Voyage[];
    activeVoyage?: Voyage | null;
    fleet: Vessel[];
    bookings: Booking[];
    forwarders: Forwarder[];
    totalCapacityLM: number;
    bookedLM: number;
    capacityPercent: number;
    loadedCount: number;
    gateInCount: number;
    pendingApprovalCount: number;
    totalRevenue: number;
    unpaidCount: number;
    riskCount: number;
    recentBookings: Booking[];
}

export default function Dashboard({
    voyages = [],
    activeVoyage,
    fleet = [],
    bookings = [],
    forwarders = [],
    totalCapacityLM = 3850,
    bookedLM = 0,
    capacityPercent = 0,
    loadedCount = 0,
    gateInCount = 0,
    pendingApprovalCount = 0,
    totalRevenue = 0,
    recentBookings = [],
}: DashboardProps) {
    const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        voyageId: activeVoyage?.id || (voyages[0]?.id ?? ''),
        shipper: forwarders[0]?.name ?? '',
        truckPlate: '',
        trailerPlate: '',
        driverName: '',
        driverPhone: '+90 5',
        category: 'Komple TIR',
        lengthMeters: 16.5,
        weightTon: 36.0,
        cargoDescription: 'Genel Ticari Yük',
        paymentMethod: 'Cari Hesap (Açık)',
    });

    const handleQuickBookingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/bookings/store', {
            onSuccess: () => {
                toast.success('Hızlı rezervasyon başarıyla açıldı.');
                setIsQuickBookingOpen(false);
                reset();
            },
            onError: () => {
                toast.error('Lütfen zorunlu alanları kontrol ediniz.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Operasyon Masası', href: '/dashboard' }]}>
            <Head title="Operasyon Masası - Cenk Ro-Ro" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Active Voyage Banner */}
                <Card className="relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-blue-950/30 via-background to-background dark:border-blue-500/30">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-500 font-semibold">
                                        AKTİF SEFER İZLEME
                                    </Badge>
                                    <span className="font-mono text-sm font-bold tracking-tight text-foreground">
                                        {activeVoyage?.id ?? 'SEFER SEÇİLMEDİ'}
                                    </span>
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-500">
                                        {activeVoyage?.status ?? 'Planlandı'}
                                    </span>
                                </div>
                                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                                    {activeVoyage?.vesselName ?? 'Gemi Belirtilmedi'} —{' '}
                                    <span className="text-blue-500 dark:text-blue-400">
                                        {activeVoyage?.route ?? 'Pendik ➔ Trieste'}
                                    </span>
                                </h1>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <span>
                                        📍 <strong>Kalkış:</strong> {activeVoyage?.departurePort ?? '-'} ({activeVoyage?.departureTime ?? '-'})
                                    </span>
                                    <span>
                                        🏁 <strong>Varış:</strong> {activeVoyage?.arrivalPort ?? '-'} ({activeVoyage?.estimatedArrival ?? '-'})
                                    </span>
                                    <span>
                                        ⚓ <strong>Rıhtım:</strong> {activeVoyage?.berth ?? 'Rıhtım 1'}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Dialog open={isQuickBookingOpen} onOpenChange={setIsQuickBookingOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
                                            <Plus className="mr-1.5 h-4 w-4" /> Yeni Rezervasyon Aç
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>Hızlı Rezervasyon Aç</DialogTitle>
                                            <DialogDescription>
                                                Seçili sefere ait araç için operasyon masasından anında bilet açın.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleQuickBookingSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="voyageId">Sefer Seçimi</Label>
                                                <Select
                                                    value={data.voyageId}
                                                    onValueChange={(val) => setData('voyageId', val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sefer seçiniz" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {voyages.map((v) => (
                                                            <SelectItem key={v.id} value={v.id}>
                                                                {v.id} - {v.vesselName} ({v.route})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="shipper">Lojistik Firması / Cari</Label>
                                                <Select
                                                    value={data.shipper}
                                                    onValueChange={(val) => setData('shipper', val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Firma seçiniz" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {forwarders.map((f) => (
                                                            <SelectItem key={f.id} value={f.name}>
                                                                {f.name} ({f.code || f.id})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="truckPlate">Çekici Plakası *</Label>
                                                    <Input
                                                        id="truckPlate"
                                                        placeholder="34 ABC 123"
                                                        value={data.truckPlate}
                                                        onChange={(e) => setData('truckPlate', e.target.value.toUpperCase())}
                                                        required
                                                    />
                                                    {errors.truckPlate && (
                                                        <p className="text-xs text-destructive">{errors.truckPlate}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="trailerPlate">Dorse Plakası</Label>
                                                    <Input
                                                        id="trailerPlate"
                                                        placeholder="34 XYZ 789"
                                                        value={data.trailerPlate}
                                                        onChange={(e) => setData('trailerPlate', e.target.value.toUpperCase())}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="driverName">Sürücü Adı</Label>
                                                    <Input
                                                        id="driverName"
                                                        placeholder="Ad Soyad"
                                                        value={data.driverName}
                                                        onChange={(e) => setData('driverName', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="driverPhone">Sürücü Telefon</Label>
                                                    <Input
                                                        id="driverPhone"
                                                        placeholder="+90 5XX XXX XX XX"
                                                        value={data.driverPhone}
                                                        onChange={(e) => setData('driverPhone', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="category">Kategori</Label>
                                                    <Select
                                                        value={data.category}
                                                        onValueChange={(val) => setData('category', val)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Komple TIR">Komple TIR</SelectItem>
                                                            <SelectItem value="Yalnız Dorse">Yalnız Dorse</SelectItem>
                                                            <SelectItem value="Frigo TIR">Frigo TIR</SelectItem>
                                                            <SelectItem value="ADR / Tanker">ADR / Tanker</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="lengthMeters">Metre (LM)</Label>
                                                    <Input
                                                        id="lengthMeters"
                                                        type="number"
                                                        step="0.1"
                                                        value={data.lengthMeters}
                                                        onChange={(e) => setData('lengthMeters', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="weightTon">Ağırlık (Ton)</Label>
                                                    <Input
                                                        id="weightTon"
                                                        type="number"
                                                        step="0.1"
                                                        value={data.weightTon}
                                                        onChange={(e) => setData('weightTon', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>

                                            <DialogFooter className="pt-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setIsQuickBookingOpen(false)}
                                                >
                                                    İptal
                                                </Button>
                                                <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                                    {processing ? 'Kaydediliyor...' : 'Rezervasyonu Onayla'}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                <Button variant="secondary" asChild>
                                    <Link href="/stowage">
                                        <Layers className="mr-1.5 h-4 w-4 text-cyan-500" /> Stif Planı
                                    </Link>
                                </Button>
                                <Button variant="secondary" asChild>
                                    <Link href="/customs">
                                        <Printer className="mr-1.5 h-4 w-4 text-teal-500" /> Manifesto
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Capacity Progress Bar */}
                    <CardContent className="pt-0">
                        <div className="rounded-lg border bg-background/50 p-3.5 backdrop-blur-sm">
                            <div className="mb-2 flex items-center justify-between text-xs font-medium">
                                <span className="text-muted-foreground">Gemi Şerit Metre (LM) Doluluk Durumu:</span>
                                <span className="font-mono font-bold text-foreground">
                                    <strong className="text-blue-500 dark:text-blue-400">{bookedLM} LM</strong> / {totalCapacityLM} LM (%{capacityPercent})
                                </span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-400 transition-all duration-500"
                                    style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 4 KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                GEMİDEKİ ARAÇLAR
                            </CardTitle>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                                <Ship className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-mono text-foreground">
                                {loadedCount}{' '}
                                <span className="text-sm font-normal text-muted-foreground">Treyler</span>
                            </div>
                            <p className="text-xs text-emerald-500 mt-1 font-medium">
                                Sefere dahil edilmiş ve yüklenmiş
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                SAHADA BEKLEYEN (GATE-IN)
                            </CardTitle>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                                <Truck className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-mono text-foreground">
                                {gateInCount}{' '}
                                <span className="text-sm font-normal text-muted-foreground">Araç</span>
                            </div>
                            <p className="text-xs text-blue-500 mt-1 font-medium">
                                Kantar ve kapıdan geçmiş, stif bekleyen
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                TAHSİL EDİLEN CİRO
                            </CardTitle>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">
                                <BadgeDollarSign className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">
                                €{Number(totalRevenue || 0).toLocaleString('tr-TR')}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                                Ödenen bilet toplam navlunu
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                ÖDEME / RİSK ONAYI BEKLEYEN
                            </CardTitle>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                                <AlertCircle className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-mono text-amber-500">
                                {pendingApprovalCount}{' '}
                                <span className="text-sm font-normal text-muted-foreground">Bilet</span>
                            </div>
                            <p className="text-xs text-amber-500/90 mt-1 font-medium">
                                Şartlı veya limit aşımı incelemesinde
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Bookings Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Son Rezervasyon ve Biniş Kayıtları</CardTitle>
                            <CardDescription>
                                Veritabanından gelen güncel araç ve operasyonel bilet kayıtları
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/bookings" className="flex items-center gap-1 text-sm font-medium">
                                Tümünü Gör ({bookings.length}) <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Bilet No (ID)</TableHead>
                                        <TableHead>Çekici / Dorse</TableHead>
                                        <TableHead>Lojistik Firması</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Sefer</TableHead>
                                        <TableHead>Ödeme Durumu</TableHead>
                                        <TableHead>Biniş / Saha Durumu</TableHead>
                                        <TableHead className="text-right">İşlemler</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentBookings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                                Henüz kayıtlı rezervasyon bulunmamaktadır.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentBookings.map((b) => (
                                            <TableRow key={b.id}>
                                                <TableCell className="font-mono font-bold text-blue-500 dark:text-blue-400">
                                                    {b.id}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-mono font-bold text-foreground">
                                                        {b.truckPlate}
                                                    </div>
                                                    {b.trailerPlate && (
                                                        <div className="font-mono text-xs text-muted-foreground">
                                                            {b.trailerPlate}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{b.shipper}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="border-blue-500/30 text-blue-500">
                                                        {b.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {b.voyageId || '⚠️ Atanmadı'}
                                                </TableCell>
                                                <TableCell>
                                                    {b.paymentStatus === 'PAID' ? (
                                                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                                                            ✓ Ödendi
                                                        </Badge>
                                                    ) : b.paymentStatus === 'WAITING_PAYMENT' ? (
                                                        <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-500">
                                                            ⏳ Ödeme Bekleniyor
                                                        </Badge>
                                                    ) : b.paymentStatus === 'PENDING_APPROVAL' ? (
                                                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500">
                                                            ⏳ Onay Bekliyor
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">🛑 Riskli / Askıda</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {b.boardingStatus === 'INCLUDED' ? (
                                                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                                                            🚢 Gemide
                                                        </Badge>
                                                    ) : b.boardingStatus === 'READY_TO_BOARD' ? (
                                                        <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-500">
                                                            🟢 Binişe Hazır
                                                        </Badge>
                                                    ) : b.boardingStatus === 'FAILED_BOARDING' ? (
                                                        <Badge variant="destructive">✕ İptal Edildi</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500">
                                                            ⏳ Beklemede
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {b.bookingChannel === 'Web' && b.paymentStatus !== 'PAID' ? (
                                                        <Button variant="ghost" size="icon" disabled className="opacity-40 cursor-not-allowed" title="Web rezervasyonu: Ödeme onayı bekleniyor">
                                                            <Lock className="h-4 w-4 text-amber-500" />
                                                        </Button>
                                                    ) : (
                                                        <Button variant="ghost" size="icon" asChild title="Biniş Kartı">
                                                            <Link href={`/bookings/boarding-pass/${b.id}`} target="_blank">
                                                                <Printer className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
