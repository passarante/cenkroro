import AppLayout from '@/layouts/app-layout';
import { Booking, BreadcrumbItem, Category, Forwarder, Tariff, Voyage } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Globe,
    Lock,
    Mail,
    Printer,
    Search,
    Ship,
    Truck,
    UserCheck,
    Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface MobilePortalProps {
    voyages: Voyage[];
    activeVoyage?: Voyage | null;
    forwarders: Forwarder[];
    tariffs: Tariff[];
    categories: Category[];
    activeTab: 'book' | 'pnr' | 'schedule' | 'history';
    pnrSearch: string;
    inquiryResult?: Booking | null;
    myBookings?: Booking[];
    selectedVoyageId?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Web Ön Rezervasyon Portalı', href: '/portal' },
];

export default function MobilePortalIndex({
    voyages = [],
    forwarders = [],
    activeTab = 'book',
    pnrSearch = '',
    inquiryResult = null,
    myBookings = [],
    selectedVoyageId = '',
}: MobilePortalProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const isFieldUser = user?.role === 'field';

    const [currentTab, setCurrentTab] = useState<'book' | 'pnr' | 'schedule' | 'history'>(activeTab);
    const [pnrQuery, setPnrQuery] = useState(pnrSearch);
    const [step2Open, setStep2Open] = useState(false);
    const [preBookingNoticeOpen, setPreBookingNoticeOpen] = useState(false);

    // Form for booking submission
    const [selectedShipperOption, setSelectedShipperOption] = useState<string>(
        isFieldUser ? (user?.company_name || '') : (forwarders[0]?.name || '')
    );
    const [newShipperName, setNewShipperName] = useState<string>('');

    const bookingForm = useForm({
        voyageId: selectedVoyageId || voyages[0]?.id || '',
        shipper: isFieldUser ? (user?.company_name || '') : (forwarders[0]?.name || ''),
        contactName: user?.name?.split(' ')[0] || '',
        contactSurname: user?.name ? user.name.split(' ').slice(1).join(' ') : '',
        contactMail: user?.email || '',
        contactPhone: user?.phone || '',
        driverName: isFieldUser ? (user?.name || '') : '',
        driverPhone: isFieldUser ? (user?.phone || '') : '',
        truckPlate: '',
        trailerPlate: '',
        weightTon: 34.0,
        vehicleKind: 'Çekici',
        trailerType: 'Tenteli',
        hasElectricity: '0',
        paymentMethod: '',
    });

    const handleShipperChange = (val: string) => {
        setSelectedShipperOption(val);
        if (val === '__NEW__') {
            bookingForm.setData('shipper', newShipperName);
        } else {
            bookingForm.setData('shipper', val);
        }
    };

    const handleNewShipperNameChange = (val: string) => {
        setNewShipperName(val);
        bookingForm.setData('shipper', val);
    };

    const handleStep1Proceed = () => {
        if (
            !bookingForm.data.voyageId ||
            !bookingForm.data.shipper.trim() ||
            !bookingForm.data.contactName.trim() ||
            !bookingForm.data.contactSurname.trim() ||
            !bookingForm.data.contactMail.trim() ||
            !bookingForm.data.contactPhone.trim()
        ) {
            toast.error('Lütfen sefer, firma ve yetkili iletişim bilgilerinin tamamını doldurunuz.');
            return;
        }
        setStep2Open(true);
    };

    const handleOpenPreBookingNotice = (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !bookingForm.data.driverName.trim() ||
            !bookingForm.data.driverPhone.trim() ||
            !bookingForm.data.truckPlate.trim()
        ) {
            toast.error('Lütfen sürücü adı, telefon ve çekici plakası alanlarını eksiksiz doldurunuz.');
            return;
        }
        setPreBookingNoticeOpen(true);
    };

    const handleConfirmPreBookingSubmit = () => {
        bookingForm.post('/portal/submit', {
            onSuccess: () => {
                setPreBookingNoticeOpen(false);
                setStep2Open(false);
                toast.success('🎉 Ön rezervasyon talebiniz başarıyla alındı! Detaylar e-posta adresinize iletilecektir.');
            },
            onError: () => {
                toast.error('Ön rezervasyon gönderilirken hata oluştu. Lütfen bilgileri kontrol edin.');
            },
        });
    };

    const handlePnrSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pnrQuery.trim()) return;
        router.get(
            '/portal',
            { tab: 'pnr', pnr: pnrQuery.trim() },
            { preserveState: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Web Ön Rezervasyon Portalı - Cenk Ro-Ro" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header Card */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-card/60 p-5 shadow-xs backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-500/20">
                            <Globe className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight text-foreground">
                                Online Web Ön Rezervasyon Sistemi
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Müşteri & Acente Self-Servis Ro-Ro Ön Rezervasyon ve Bilet İşlemleri
                            </p>
                        </div>
                    </div>

                    {/* Nav tabs */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant={currentTab === 'book' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentTab('book')}
                            className="font-medium"
                        >
                            <FileText className="mr-1.5 h-4 w-4" /> Yeni Ön Rezervasyon
                        </Button>
                        <Button
                            variant={currentTab === 'pnr' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentTab('pnr')}
                            className="font-medium"
                        >
                            <Search className="mr-1.5 h-4 w-4" /> PNR / Ön Rezervasyon Sorgula
                        </Button>
                        <Button
                            variant={currentTab === 'schedule' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentTab('schedule')}
                            className="font-medium"
                        >
                            <Calendar className="mr-1.5 h-4 w-4" /> Sefer Takvimi
                        </Button>
                        {user && (
                            <Button
                                variant={currentTab === 'history' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentTab('history')}
                                className="font-medium"
                            >
                                <Truck className="mr-1.5 h-4 w-4" /> Geçmiş Ön Rezervasyonlarım
                                {myBookings.length > 0 && (
                                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-primary/20 text-foreground font-bold">
                                        {myBookings.length}
                                    </span>
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* TAB 1: YENİ REZERVASYON FORMU */}
                {currentTab === 'book' && (
                    <Card className="mx-auto w-full max-w-4xl border-border/80 bg-card/70 shadow-sm">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle className="text-xl font-bold text-foreground">
                                Ön Rezervasyon Bilgileri
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Adım 1 / 2: Sefer ve yetkili iletişim bilgilerini giriniz
                            </p>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {/* Sefer Seçimi (Tek Sütun) */}
                                <div className="space-y-2">
                                    <Label className="font-semibold text-foreground">Sefer Seçimi *</Label>
                                    <select
                                        value={bookingForm.data.voyageId}
                                        onChange={(e) => bookingForm.setData('voyageId', e.target.value)}
                                        className="w-full rounded-md border border-input bg-background/90 px-3 py-2 text-sm shadow-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer"
                                        required
                                    >
                                        {voyages.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.id} {v.vesselName} — {v.route} {v.departureTime ? `(${v.departureTime})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Firma Seçimi / Metin Girişi */}
                                {isFieldUser ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="font-semibold text-foreground">Firma Ünvanı / Cari Adı *</Label>
                                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                                                Saha Kullanıcısı Doğrudan Giriş
                                            </span>
                                        </div>
                                        <Input
                                            placeholder="Firma / Cari adınızı yazınız (Örn: Demir Uluslararası Taşımacılık)"
                                            value={bookingForm.data.shipper}
                                            onChange={(e) => bookingForm.setData('shipper', e.target.value)}
                                            required
                                        />
                                        <p className="text-[11px] text-muted-foreground">
                                            Saha kullanıcıları firma listesini görmeden kendi firma adlarını doğrudan girerek rezervasyon oluşturur.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="font-semibold text-foreground">Firma (Acente/Lojistik) *</Label>
                                            <select
                                                value={selectedShipperOption}
                                                onChange={(e) => handleShipperChange(e.target.value)}
                                                className="w-full rounded-md border border-input bg-background/90 px-3 py-2 text-sm shadow-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer"
                                                required
                                            >
                                                <option value="">-- Firma Seçiniz --</option>
                                                {forwarders.map((f) => (
                                                    <option key={f.id} value={f.name}>
                                                        {f.name}
                                                    </option>
                                                ))}
                                                <option value="__NEW__" className="font-bold text-sky-500">
                                                    ➕ Yeni Firma Ekle (Listede Yoksa)
                                                </option>
                                            </select>
                                        </div>

                                        {/* Yeni Firma Giriş Alanı */}
                                        {selectedShipperOption === '__NEW__' && (
                                            <div className="space-y-2 animate-in fade-in-50 duration-200 bg-sky-500/5 p-4 rounded-lg border border-sky-500/20">
                                                <div className="flex items-center justify-between">
                                                    <Label className="font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5 text-xs">
                                                        <span className="inline-block w-2 h-2 rounded-full bg-sky-500"></span>
                                                        Yeni Firma Ünvanı / Cari Adı *
                                                    </Label>
                                                    <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold bg-sky-500/10 px-2 py-0.5 rounded">
                                                        Yeni Cari Kaydı
                                                    </span>
                                                </div>
                                                <Input
                                                    placeholder="Yeni firma / cari adını giriniz (Örn: ABC LOJİSTİK A.Ş.)"
                                                    value={newShipperName}
                                                    onChange={(e) => handleNewShipperNameChange(e.target.value)}
                                                    autoFocus
                                                    required
                                                />
                                                <p className="text-[11px] text-muted-foreground">
                                                    Girdiğiniz firma rezervasyonunuza yeni cari firma olarak kaydedilecektir.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Row 2: Yetkili Adı & Soyadı */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-foreground">Yetkili Adı *</Label>
                                        <Input
                                            placeholder="Ahmet"
                                            value={bookingForm.data.contactName}
                                            onChange={(e) => bookingForm.setData('contactName', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-semibold text-foreground">Yetkili Soyadı *</Label>
                                        <Input
                                            placeholder="Yılmaz"
                                            value={bookingForm.data.contactSurname}
                                            onChange={(e) => bookingForm.setData('contactSurname', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Yetkili Mail & Telefon */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-foreground">Yetkili E-Posta *</Label>
                                        <Input
                                            type="email"
                                            placeholder="operasyon@firma.com"
                                            value={bookingForm.data.contactMail}
                                            onChange={(e) => bookingForm.setData('contactMail', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-semibold text-foreground">Yetkili Telefon *</Label>
                                        <Input
                                            placeholder="0532 123 4567"
                                            value={bookingForm.data.contactPhone}
                                            onChange={(e) => bookingForm.setData('contactPhone', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-center pt-4">
                                    <Button
                                        type="button"
                                        onClick={handleStep1Proceed}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-2.5 shadow-md shadow-emerald-600/20"
                                    >
                                        Kaydet ve Araç / Sürücü Bilgileri Gir ➔
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* TAB 2: PNR & BİLET SORGULAMA */}
                {currentTab === 'pnr' && (
                    <Card className="mx-auto w-full max-w-3xl border-border/80 bg-card/70 shadow-sm">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle className="text-xl font-bold text-foreground">
                                Ön Rezervasyon & PNR Sorgulama
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Ön rezervasyon kodu veya çekici plakası ile bilet detaylarınızı görüntüleyin
                            </p>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <form onSubmit={handlePnrSearch} className="flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="PNR Kodu (Örn: BK-2026-6418) veya Çekici Plakası..."
                                        value={pnrQuery}
                                        onChange={(e) => setPnrQuery(e.target.value)}
                                        className="pl-9 font-mono text-sm"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                                    Sorgula
                                </Button>
                            </form>

                            {inquiryResult ? (
                                <div className="rounded-xl border-2 border-sky-500/40 bg-sky-50/50 dark:bg-sky-500/5 p-6 shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between border-b border-border/60 pb-3 mb-4 gap-2">
                                        <div>
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                Ön Rezervasyon No (PNR)
                                            </span>
                                            <div className="font-mono text-2xl font-black text-sky-600 dark:text-sky-400">
                                                {inquiryResult.id}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {inquiryResult.paymentStatus === 'PAID' ? (
                                                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1">
                                                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Ödeme Onaylandı (Ödendi)
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold px-3 py-1">
                                                    <Clock className="mr-1 h-3.5 w-3.5" /> ⏳ Ödeme Onayı Bekleniyor
                                                </Badge>
                                            )}
                                            <Badge variant="outline" className={inquiryResult.paymentStatus === 'PAID' ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1" : "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-3 py-1"}>
                                                {inquiryResult.paymentStatus === 'PAID' ? (
                                                    <>
                                                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Tescilli Rezervasyon
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="mr-1">📝</span> Ön Rezervasyon Kaydı
                                                    </>
                                                )}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-foreground/90 mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">🏢 Firma:</span>
                                            <strong className="text-foreground">{inquiryResult.shipper}</strong>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">👤 Yetkili:</span>
                                            <span>{inquiryResult.contactName} {inquiryResult.contactSurname} ({inquiryResult.contactPhone})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">🚚 Çekici Plaka:</span>
                                            <strong className="font-mono text-sky-600 dark:text-sky-400 font-bold">{inquiryResult.truckPlate}</strong>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">👨‍✈️ Sürücü:</span>
                                            <span>{inquiryResult.driverName} ({inquiryResult.driverPhone})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">🚢 Sefer:</span>
                                            <strong className="font-mono">{inquiryResult.voyageId}</strong>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">📍 Güzergah:</span>
                                            <span>{inquiryResult.voyage?.route || 'Pendik ➔ Trieste'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">📦 Araç Cinsi:</span>
                                            <span>{inquiryResult.vehicleKind} / {inquiryResult.trailerType} ({inquiryResult.weightTon} Ton)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">⚡ Elektrik / Frigo:</span>
                                            <span className={inquiryResult.hasElectricity ? 'text-emerald-500 font-semibold' : ''}>
                                                {inquiryResult.hasElectricity ? 'Var (Elektrikli)' : 'Yok'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">💳 Ödeme Durumu:</span>
                                            {inquiryResult.paymentStatus === 'PAID' ? (
                                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Ödendi ({inquiryResult.paymentMethod || 'Cari Hesap'})
                                                </span>
                                            ) : (
                                                <span className="text-amber-600 dark:text-amber-500 font-semibold inline-flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" /> Ödeme Onayı Bekleniyor ({inquiryResult.paymentMethod || 'Belirlenmedi'})
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">🌐 Rezervasyon Kanalı:</span>
                                            <span className="font-medium text-foreground">{inquiryResult.bookingChannel || 'Web'}</span>
                                        </div>
                                    </div>

                                    {(() => {
                                        const isPrintBlocked = inquiryResult.bookingChannel === 'Web' && inquiryResult.paymentStatus !== 'PAID';

                                        if (isPrintBlocked) {
                                            return (
                                                <div className="space-y-4 border-t border-border/60 pt-4">
                                                    {/* Belirgin Ön Rezervasyon Deklarasyon Kutusu */}
                                                    <div className="rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-4 text-amber-950 dark:text-amber-200 space-y-2.5 shadow-xs">
                                                        <div className="flex items-center gap-2 font-extrabold text-sm text-amber-800 dark:text-amber-300">
                                                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-black">!</span>
                                                            DİKKAT: BU BİR ÖN REZERVASYONDUR
                                                        </div>
                                                        <p className="text-xs sm:text-sm leading-relaxed font-semibold">
                                                            Bu bir ön rezervasyondur. Ödeme onayı ve evrak girişleri tamamlandıktan sonra ve operasyonel bir engel olmadığında rezervasyonunuz onaylanır.
                                                        </p>
                                                        <div className="rounded-lg bg-background/90 p-2.5 border border-amber-500/30 flex items-start gap-2.5">
                                                            <Mail className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                            <p className="text-xs font-medium text-foreground leading-snug">
                                                                Rezervasyonunuz onaylandığında kayıtlı <strong className="text-emerald-600 dark:text-emerald-400">{inquiryResult.contactMail || 'e-posta'}</strong> adresinize <span className="underline font-semibold">mail ile bildirim yapacağız</span> ve biniş kartınız yazdırılabilir hale gelecektir.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end">
                                                        <Button
                                                            disabled
                                                            variant="outline"
                                                            className="opacity-70 cursor-not-allowed border-amber-500/40 bg-muted/40 text-muted-foreground font-medium text-xs h-9"
                                                            title="Ödeme ve evrak onayı tamamlanana kadar biniş kartı oluşturulamaz"
                                                        >
                                                            <Lock className="mr-2 h-4 w-4 text-amber-500" /> Biniş Kartı Kilitli (Ön Rezervasyon Onayı Bekleniyor)
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="flex justify-end border-t border-border/60 pt-4">
                                                <a
                                                    href={`/bookings/boarding-pass/${inquiryResult.id}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                                                >
                                                    <Printer className="h-4 w-4" /> Resmi Biniş Kartını Yazdır (PDF)
                                                </a>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : pnrQuery ? (
                                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-6 text-center text-sm text-rose-400">
                                    ❌ &quot;{pnrQuery}&quot; kodlu veya plakalı aktif rezervasyon kaydı bulunamadı.
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                )}

                {/* TAB 3: SEFER TAKVİMİ */}
                {currentTab === 'schedule' && (
                    <Card className="mx-auto w-full max-w-5xl border-border/80 bg-card/70 shadow-sm">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle className="text-xl font-bold text-foreground">
                                Güncel Ro-Ro Sefer Takvimi
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Karadeniz ve Akdeniz hatları aktif seferler ve rıhtım çizelgesi
                            </p>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {voyages.map((voyage) => (
                                    <div
                                        key={voyage.id}
                                        className="flex flex-col justify-between rounded-lg border border-border/70 bg-background/50 p-4 transition-all hover:border-sky-500/40 hover:shadow-md"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <strong className="text-base text-foreground font-bold">
                                                    {voyage.vesselName}
                                                </strong>
                                                <Badge variant="outline" className="font-mono text-xs border-sky-400/30 text-sky-400">
                                                    {voyage.id}
                                                </Badge>
                                            </div>

                                            <div className="text-xs font-semibold text-emerald-400 mb-3">
                                                {voyage.route}
                                            </div>

                                            <div className="space-y-1.5 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5 text-sky-400" />
                                                    <span>
                                                        Kalkış: <strong className="text-foreground">{voyage.departureTime}</strong>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Ship className="h-3.5 w-3.5 text-teal-400" />
                                                    <span>
                                                        Tahmini Varış: <strong className="text-foreground">{voyage.estimatedArrival}</strong>
                                                    </span>
                                                </div>
                                                <div>
                                                    Rıhtım / Rampa: <span className="font-medium text-foreground">{voyage.berth}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-border/50 pt-3 mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-xs font-semibold text-sky-400 hover:bg-sky-500/10 hover:text-sky-300"
                                                onClick={() => {
                                                    bookingForm.setData('voyageId', voyage.id);
                                                    setCurrentTab('book');
                                                }}
                                            >
                                                Bu Sefere Ön Rezervasyon Yap ➔
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* TAB 4: GEÇMİŞ İŞLEM KAYITLARI */}
                {currentTab === 'history' && (
                    <Card className="mx-auto w-full max-w-5xl border-border/80 bg-card/70 shadow-sm">
                        <CardHeader className="border-b border-border/50 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-primary" />
                                    Geçmiş Ön Rezervasyonlarım & Biniş Kayıtları
                                </CardTitle>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Hesabınıza ({user?.email}) ait tescilli tüm geçmiş ön rezervasyonlar ve güncel durumları
                                </p>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => setCurrentTab('book')}
                                className="text-xs font-semibold self-start sm:self-auto"
                            >
                                <FileText className="mr-1.5 h-3.5 w-3.5" />
                                Yeni Ön Rezervasyon Yap
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            {myBookings.length === 0 ? (
                                <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
                                    <Truck className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                                    <h3 className="text-base font-semibold text-foreground">Henüz bir ön rezervasyon kaydınız bulunmuyor</h3>
                                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                                        Aktif seferlerimizden birini seçerek anında online ön rezervasyon oluşturabilirsiniz.
                                    </p>
                                    <Button size="sm" onClick={() => setCurrentTab('book')}>
                                        Hemen Ön Rezervasyon Oluştur
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myBookings.map((b) => {
                                        const isPaid = b.paymentStatus === 'PAID';
                                        return (
                                            <div
                                                key={b.id}
                                                className="rounded-xl border border-border/70 bg-background/60 p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3 mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono text-lg font-black text-primary">
                                                            {b.id}
                                                        </span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {b.bookingChannel || 'Web'}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {b.created_at ? new Date(b.created_at).toLocaleDateString('tr-TR') : ''}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {isPaid ? (
                                                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-semibold">
                                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                Ödeme Onaylandı
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-semibold">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                Ödeme Bekleniyor
                                                            </Badge>
                                                        )}
                                                        <Badge variant="secondary" className="text-xs">
                                                            {b.status}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                                                    <div>
                                                        <span className="text-muted-foreground block text-[11px]">Firma:</span>
                                                        <span className="font-semibold text-foreground">{b.shipper}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block text-[11px]">Sefer / Hat:</span>
                                                        <span className="font-medium text-foreground">{b.voyageId} — {b.voyage?.route || 'Pendik ➔ Trieste'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block text-[11px]">Plaka / Sürücü:</span>
                                                        <span className="font-mono font-bold text-foreground">{b.truckPlate}</span>
                                                        {b.driverName && <span className="text-muted-foreground block">{b.driverName}</span>}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block text-[11px]">Araç Tipi / Ağırlık:</span>
                                                        <span className="text-foreground">{b.vehicleKind || 'Komple TIR'} ({b.weightTon} Ton)</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
                                                    <div className="text-muted-foreground">
                                                        MRN: <span className="font-mono text-foreground">{b.mrnNumber || '—'}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs h-8"
                                                            onClick={() => {
                                                                setPnrQuery(b.id);
                                                                setCurrentTab('pnr');
                                                                router.get('/portal', { tab: 'pnr', pnr: b.id });
                                                            }}
                                                        >
                                                            <Search className="h-3 w-3 mr-1" />
                                                            Detay / Sorgula
                                                        </Button>

                                                        {isPaid ? (
                                                            <a
                                                                href={`/bookings/boarding-pass/${b.id}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90"
                                                            >
                                                                <Printer className="h-3.5 w-3.5" />
                                                                Biniş Kartı (PDF)
                                                            </a>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                disabled
                                                                variant="outline"
                                                                className="opacity-60 cursor-not-allowed border-amber-500/30 text-xs h-8"
                                                                title="Banka ödemesi onaylanana kadar biniş kartı oluşturulamaz"
                                                            >
                                                                <Lock className="h-3 w-3 mr-1 text-amber-500" />
                                                                Biniş Kartı Kilitli
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* STEP 2 DIALOG: SÜRÜCÜ VE ARAÇ BİLGİLERİ */}
                <Dialog open={step2Open} onOpenChange={setStep2Open}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg">
                                <Truck className="h-5 w-5 text-emerald-400" /> Sürücü ve Araç Bilgileri (Ön Rezervasyon Adım 2 / 2)
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleOpenPreBookingNotice} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Sürücü Ad & Soyad *</Label>
                                    <Input
                                        placeholder="Mehmet Veli"
                                        value={bookingForm.data.driverName}
                                        onChange={(e) => bookingForm.setData('driverName', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Sürücü Telefon *</Label>
                                    <Input
                                        placeholder="0555 555 5555"
                                        value={bookingForm.data.driverPhone}
                                        onChange={(e) => bookingForm.setData('driverPhone', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Çekici Plaka *</Label>
                                    <Input
                                        placeholder="34 ASB 25"
                                        value={bookingForm.data.truckPlate}
                                        onChange={(e) => bookingForm.setData('truckPlate', e.target.value.toUpperCase())}
                                        className="font-mono uppercase"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Toplam Tonaj (Ton)</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={bookingForm.data.weightTon}
                                        onChange={(e) => bookingForm.setData('weightTon', parseFloat(e.target.value) || 0)}
                                        className="font-mono"
                                        placeholder="34.0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Araç Cinsi</Label>
                                    <select
                                        value={bookingForm.data.vehicleKind}
                                        onChange={(e) => bookingForm.setData('vehicleKind', e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                    >
                                        <option value="Çekici">Çekici</option>
                                        <option value="Kamyon">Kamyon</option>
                                        <option value="Yarı Römork">Yarı Römork</option>
                                        <option value="Römork">Römork</option>
                                        <option value="Tanker">Tanker</option>
                                        <option value="Kamyonet">Kamyonet</option>
                                        <option value="Özel Amaçlı">Özel Amaçlı</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Dorse Tipi</Label>
                                    <select
                                        value={bookingForm.data.trailerType}
                                        onChange={(e) => bookingForm.setData('trailerType', e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                    >
                                        <option value="Tenteli">Tenteli</option>
                                        <option value="Frigo / Soğutuculu">Frigo / Soğutuculu</option>
                                        <option value="Açık Kasa">Açık Kasa</option>
                                        <option value="Silobas">Silobas</option>
                                        <option value="Konteyner Taşıyıcı">Konteyner Taşıyıcı</option>
                                        <option value="Lowbed">Lowbed</option>
                                        <option value="Damperli">Damperli</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Elektrik Bağlantısı</Label>
                                    <select
                                        value={bookingForm.data.hasElectricity}
                                        onChange={(e) => bookingForm.setData('hasElectricity', e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                    >
                                        <option value="0">Elektrik İstemiyor (Kuru Yük)</option>
                                        <option value="1">Elektrik İstiyor (Frigo / Soğutucu)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Dorse Plakası (Opsiyonel)</Label>
                                    <Input
                                        placeholder="34 TR 987"
                                        value={bookingForm.data.trailerPlate}
                                        onChange={(e) => bookingForm.setData('trailerPlate', e.target.value.toUpperCase())}
                                        className="font-mono uppercase"
                                    />
                                </div>
                            </div>

                            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                                <span className="text-base leading-none">⏳</span>
                                <div>
                                    <span className="font-semibold">Ön Rezervasyon Bilgilendirmesi:</span>
                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                                        Ön rezervasyon talebiniz doğrudan operasyon onay listesine düşecektir. Ödeme tipi ve evrak onayı tamamlandıktan sonra biniş kartınız hazır olacaktır.
                                    </p>
                                </div>
                            </div>

                            <DialogFooter className="pt-4 border-t border-border/60">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep2Open(false)}
                                >
                                    Geri Dön
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={bookingForm.processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                >
                                    {bookingForm.processing ? 'İşleniyor...' : 'Ön Rezervasyonu Onayla ve Tamamla'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Ön Rezervasyon Bilgilendirme ve Onay Diyaloğu */}
                <Dialog open={preBookingNoticeOpen} onOpenChange={setPreBookingNoticeOpen}>
                    <DialogContent className="max-w-md md:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-bold text-amber-700 dark:text-amber-400">
                                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                                Ön Rezervasyon Bilgilendirmesi & Onay
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 pt-1">
                            {/* Belirgin Deklarasyon Kutusu */}
                            <div className="rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-4 text-amber-950 dark:text-amber-200 space-y-3 shadow-xs">
                                <div className="flex items-center gap-2 font-extrabold text-sm text-amber-800 dark:text-amber-300">
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-black">!</span>
                                    DİKKAT: BU BİR ÖN REZERVASYONDUR
                                </div>
                                <p className="text-xs md:text-sm leading-relaxed font-semibold">
                                    Bu bir ön rezervasyondur. Ödeme onayı ve evrak girişleri tamamlandıktan sonra ve operasyonel bir engel olmadığında rezervasyonunuz onaylanır.
                                </p>
                                <div className="rounded-lg bg-background/90 p-3 border border-amber-500/30 flex items-start gap-2.5">
                                    <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <p className="text-xs font-medium text-foreground leading-snug">
                                        Rezervasyonunuz onaylandığında tarafınıza <strong className="text-emerald-600 dark:text-emerald-400">{bookingForm.data.contactMail || 'kayıtlı e-posta'}</strong> adresiniz üzerinden <span className="underline font-semibold">mail ile bildirim yapacağız.</span>
                                    </p>
                                </div>
                            </div>

                            {/* Özet Bilgiler */}
                            <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-xs space-y-2">
                                <div className="flex justify-between items-center text-muted-foreground pb-1.5 border-b border-border/40">
                                    <span>Taşıyıcı / Firma:</span>
                                    <span className="font-semibold text-foreground">{bookingForm.data.shipper}</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground pb-1.5 border-b border-border/40">
                                    <span>Çekici Plakası:</span>
                                    <span className="font-mono font-bold text-foreground">{bookingForm.data.truckPlate}</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Sürücü / Telefon:</span>
                                    <span className="font-medium text-foreground">{bookingForm.data.driverName} ({bookingForm.data.driverPhone})</span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-3 border-t border-border/60">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPreBookingNoticeOpen(false)}
                                disabled={bookingForm.processing}
                            >
                                Geri Dön / Düzenle
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirmPreBookingSubmit}
                                disabled={bookingForm.processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                                {bookingForm.processing ? 'Gönderiliyor...' : 'Anladım, Ön Rezervasyonu Tamamla'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
