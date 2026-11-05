import { Booking, Category, Forwarder, SharedData, Tariff, Vessel, Voyage } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Anchor,
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    FileText,
    HelpCircle,
    Info,
    LayoutGrid,
    Lock,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Printer,
    Search,
    Shield,
    Ship,
    Truck,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface LandingProps {
    voyages: Voyage[];
    vessels: Vessel[];
    tariffs: Tariff[];
    forwarders: Forwarder[];
    categories: Category[];
    pnrQuery: string;
    searchResult?: Booking | null;
    initialModal?: string | null;
}

export default function Landing({
    voyages = [],
    vessels = [],
    tariffs = [],
    forwarders = [],
    pnrQuery = '',
    searchResult = null,
    initialModal = null,
}: LandingProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    const handleReservationClick = (voyageId?: string) => {
        if (user) {
            const url = voyageId ? `/portal?tab=book&voyageId=${voyageId}` : '/portal?tab=book';
            router.visit(url);
        } else {
            const url = voyageId ? `/login/otp?redirect=/portal&voyageId=${voyageId}` : '/login/otp?redirect=/portal';
            router.visit(url);
        }
    };

    // Modal states
    const [reservationOpen, setReservationOpen] = useState(false);
    const [subStep2Open, setSubStep2Open] = useState(false);
    const [preBookingNoticeOpen, setPreBookingNoticeOpen] = useState(false);
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [tariffOpen, setTariffOpen] = useState(false);
    const [fleetOpen, setFleetOpen] = useState(false);
    const [pnrOpen, setPnrOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);

    // Cookie Banner
    const [cookieVisible, setCookieVisible] = useState(false);

    useEffect(() => {
        try {
            if (localStorage.getItem('cenk_cookie_dismissed') !== '1') {
                setCookieVisible(true);
            }
        } catch {
            setCookieVisible(true);
        }

        // Open initial modal if passed via URL
        if (initialModal === 'pnr' || searchResult || pnrQuery) {
            setPnrOpen(true);
        } else if (initialModal === 'reservation') {
            setReservationOpen(true);
        } else if (initialModal === 'schedule') {
            setScheduleOpen(true);
        } else if (initialModal === 'tariffs') {
            setTariffOpen(true);
        } else if (initialModal === 'fleet') {
            setFleetOpen(true);
        }
    }, [initialModal, searchResult, pnrQuery]);

    const dismissCookie = () => {
        setCookieVisible(false);
        try {
            localStorage.setItem('cenk_cookie_dismissed', '1');
        } catch {
            // ignore
        }
    };

    // PNR Search
    const [searchPnrInput, setSearchPnrInput] = useState(pnrQuery);
    const handlePnrSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchPnrInput.trim()) return;
        router.get(
            '/',
            { open: 'pnr', pnr: searchPnrInput.trim() },
            { preserveState: true }
        );
    };

    // Reservation Form
    const [selectedShipperOption, setSelectedShipperOption] = useState<string>(
        forwarders[0]?.name || ''
    );
    const [newShipperName, setNewShipperName] = useState<string>('');

    const bookingForm = useForm({
        voyageId: voyages[0]?.id || '',
        shipper: forwarders[0]?.name || '',
        contactName: '',
        contactSurname: '',
        contactMail: '',
        contactPhone: '',
        driverName: '',
        driverPhone: '',
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

    const handleStep1Submit = () => {
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
        setSubStep2Open(true);
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
                setSubStep2Open(false);
                setReservationOpen(false);
                toast.success('🎉 Ön rezervasyonunuz başarıyla kaydedildi! Detaylar mail ile iletilecektir.');
            },
            onError: () => {
                toast.error('Ön rezervasyon oluşturulurken bir hata oluştu.');
            },
        });
    };

    const handleSelectVoyageAndBook = (voyageId: string) => {
        setScheduleOpen(false);
        handleReservationClick(voyageId);
    };

    return (
        <div className="relative min-h-screen w-full bg-[#021730] text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-sky-500 selection:text-white">
            <Head title="CENK RORO | Karadeniz & Akdeniz Düzenli Ro-Ro Hatları" />

            {/* 1. TOP HEADER NAVIGATION */}
            <header className="fixed top-0 left-0 right-0 z-50 h-[68px] bg-white text-slate-800 shadow-md flex items-center justify-between px-6 md:px-12 transition-all">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <img
                        src="/img/logo.png"
                        alt="CENK RORO"
                        className="h-10 w-auto max-w-[240px] object-contain"
                        onError={(e) => {
                            // Fallback if image path differs
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <span className="text-2xl font-black tracking-tight text-[#05264b] flex items-center gap-1">
                        CENK <Anchor className="h-5 w-5 text-sky-600" /> RORO
                    </span>
                </Link>

                {/* Nav Menus */}
                <nav className="hidden lg:flex items-center gap-8">
                    {/* Services Dropdown */}
                    <div className="group relative py-4">
                        <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-sky-600 transition-colors">
                            Hizmetlerimiz
                            <span className="text-xs">▼</span>
                        </button>
                        <div className="absolute top-full left-0 hidden group-hover:flex flex-col min-w-[260px] rounded-lg border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50">
                            <button
                                onClick={() => setScheduleOpen(true)}
                                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                            >
                                <Ship className="h-4 w-4 text-sky-600" /> Düzenli Ro-Ro Seferleri
                            </button>
                            <button
                                onClick={() => handleReservationClick()}
                                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                            >
                                <FileText className="h-4 w-4 text-emerald-600" /> Online Rezervasyon & Bilet
                            </button>
                            <button
                                onClick={() => setTariffOpen(true)}
                                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                            >
                                <DollarSign className="h-4 w-4 text-amber-600" /> Navlun & Fiyat Tarifeleri
                            </button>
                            <button
                                onClick={() => setFleetOpen(true)}
                                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                            >
                                <Anchor className="h-4 w-4 text-indigo-600" /> Cenk Ro-Ro Filosu
                            </button>
                            <button
                                onClick={() => setPnrOpen(true)}
                                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                            >
                                <Search className="h-4 w-4 text-teal-600" /> PNR & Biniş Kartı Sorgula
                            </button>
                        </div>
                    </div>

                    {/* About */}
                    <button
                        onClick={() => setAboutOpen(true)}
                        className="text-sm font-semibold text-slate-700 hover:text-sky-600 transition-colors"
                    >
                        Hakkımızda
                    </button>

                    {/* Contact */}
                    <button
                        onClick={() => setContactOpen(true)}
                        className="text-sm font-semibold text-slate-700 hover:text-sky-600 transition-colors"
                    >
                        İletişim & Acenteler
                    </button>
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-1.5 text-base">
                        <span title="Türkçe" className="cursor-pointer hover:scale-110 transition-transform">🇹🇷</span>
                        <span title="English" className="cursor-pointer hover:scale-110 transition-transform">🇬🇧</span>
                        <span title="Русский" className="cursor-pointer hover:scale-110 transition-transform">🇷🇺</span>
                    </div>

                    <Link
                        href={user ? (user.role === 'field' ? '/portal' : '/dashboard') : '/login/otp'}
                        className="flex items-center gap-2 rounded-lg border border-sky-500/40 bg-[#0f172a] px-4 py-2 text-xs font-bold text-sky-400 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                    >
                        <Shield className="h-4 w-4 text-sky-400" />
                        <span>Platform Girişi</span>
                    </Link>
                </div>
            </header>

            {/* 2. HERO SECTION */}
            <main
                className="relative min-h-screen w-full flex items-center justify-center pt-20 px-4 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `linear-gradient(rgba(5, 38, 75, 0.78), rgba(2, 23, 48, 0.88)), url('/img/slide1.png'), url('/images/cenk_hero.jpg')`,
                }}
            >
                {/* Left Floating Circular Badges */}
                <div className="hidden xl:flex absolute left-10 top-36 flex-col gap-5 z-20">
                    <button
                        onClick={() => handleReservationClick()}
                        className="group flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white text-slate-800 shadow-xl border-2 border-white/80 hover:scale-108 hover:shadow-2xl transition-all cursor-pointer p-2"
                        title="Online Web Rezervasyon"
                    >
                        <FileText className="h-6 w-6 text-sky-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#05264b] mt-1 text-center leading-tight">
                            Rezervasyon
                        </span>
                    </button>

                    <button
                        onClick={() => setPnrOpen(true)}
                        className="group flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white text-slate-800 shadow-xl border-2 border-white/80 hover:scale-108 hover:shadow-2xl transition-all cursor-pointer p-2"
                        title="PNR & Ödeme Sorgula"
                    >
                        <Search className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#05264b] mt-1 text-center leading-tight">
                            Bilet / PNR
                        </span>
                    </button>

                    <button
                        onClick={() => setFleetOpen(true)}
                        className="group flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white text-slate-800 shadow-xl border-2 border-white/80 hover:scale-108 hover:shadow-2xl transition-all cursor-pointer p-2"
                        title="Cenk Ro-Ro Filosu"
                    >
                        <Anchor className="h-6 w-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#05264b] mt-1 text-center leading-tight">
                            Filomuz
                        </span>
                    </button>
                </div>

                {/* Center Action Box */}
                <div className="relative z-20 flex flex-col items-center max-w-xl w-full text-center">
                    <Badge variant="outline" className="mb-4 border-sky-400/40 bg-sky-500/10 text-sky-300 font-semibold px-4 py-1.5 text-xs backdrop-blur-sm">
                        ⚓ Türkiye ➔ İtalya & Karadeniz Düzenli Hatları
                    </Badge>

                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 drop-shadow-md">
                        CENK RO-RO
                    </h1>
                    <p className="text-sm sm:text-base text-slate-200 mb-8 max-w-md font-medium leading-relaxed drop-shadow-sm">
                        Uluslararası standartlarda güvenli, dakik ve modern Ro-Ro taşımacılığı.
                    </p>

                    {/* Visual 3-Block Buttons matching Cenk original layout */}
                    <div className="flex flex-col gap-3 w-full max-w-md">
                        {/* Top: REZERVASYON YAP */}
                        <button
                            onClick={() => handleReservationClick()}
                            className="w-full rounded-md bg-white text-[#05264b] font-black tracking-wider uppercase py-4 px-6 text-base shadow-2xl hover:bg-[#05264b] hover:text-white hover:border-[#05264b] transition-all transform hover:-translate-y-0.5"
                        >
                            REZERVASYON YAP
                        </button>

                        {/* Middle 2 Buttons: SEFERLER | FİYAT LİSTESİ */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setScheduleOpen(true)}
                                className="w-full rounded-md bg-white text-[#05264b] font-black tracking-wider uppercase py-3.5 px-4 text-sm shadow-2xl hover:bg-[#05264b] hover:text-white transition-all transform hover:-translate-y-0.5"
                            >
                                SEFERLER
                            </button>
                            <button
                                onClick={() => setTariffOpen(true)}
                                className="w-full rounded-md bg-white text-[#05264b] font-black tracking-wider uppercase py-3.5 px-4 text-sm shadow-2xl hover:bg-[#05264b] hover:text-white transition-all transform hover:-translate-y-0.5"
                            >
                                FİYAT LİSTESİ
                            </button>
                        </div>

                        {/* Bottom: FİLOMUZ */}
                        <button
                            onClick={() => setFleetOpen(true)}
                            className="w-full rounded-md bg-white text-[#05264b] font-black tracking-wider uppercase py-3.5 px-6 text-sm shadow-2xl hover:bg-[#05264b] hover:text-white transition-all transform hover:-translate-y-0.5"
                        >
                            FİLOMUZ
                        </button>
                    </div>
                </div>

                {/* Right Floating Quick Tools */}
                <div className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-20">
                    <button
                        onClick={() => setScheduleOpen(true)}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/20 hover:bg-sky-600 hover:scale-110 transition-all shadow-lg cursor-pointer"
                        title="Sefer Takvimi"
                    >
                        <LayoutGrid className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setContactOpen(true)}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/20 hover:bg-sky-600 hover:scale-110 transition-all shadow-lg cursor-pointer"
                        title="Canlı Destek & İletişim"
                    >
                        <MessageCircle className="h-5 w-5" />
                    </button>
                </div>
            </main>

            {/* 3. COOKIE BANNER */}
            {cookieVisible && (
                <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 bg-slate-950/95 backdrop-blur-md border-t border-white/10 px-6 py-3 text-xs text-slate-300">
                    <span className="flex-1 text-center md:text-left">
                        Cenk Ro-Ro web sitesi kullanıcı deneyiminizi geliştirmek için çerezler kullanmaktadır.
                        Web sitemizi kullanarak çerez politikamızı kabul etmiş olursunuz.
                    </span>
                    <button
                        onClick={dismissCookie}
                        className="font-bold underline text-white hover:text-sky-400 whitespace-nowrap cursor-pointer"
                    >
                        Kapat
                    </button>
                </div>
            )}

            {/* ================= MODALS & DIALOGS ================= */}

            {/* 1. REZERVASYON MODALI (ADIM 1 / 2) */}
            <Dialog open={reservationOpen} onOpenChange={setReservationOpen}>
                <DialogContent className="max-w-3xl bg-white text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-sky-600" /> Rezervasyon Bilgileri (Adım 1 / 2)
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        {/* Sefer Seçimi (Tek Sütun) */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700">Sefer Seçimi *</Label>
                            <select
                                value={bookingForm.data.voyageId}
                                onChange={(e) => bookingForm.setData('voyageId', e.target.value)}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer"
                                required
                            >
                                {voyages.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.id} {v.vesselName} — {v.route} {v.departureTime ? `(${v.departureTime})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Firma Seçimi (Tek Sütun) */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700">Firma *</Label>
                            <select
                                value={selectedShipperOption}
                                onChange={(e) => handleShipperChange(e.target.value)}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer"
                                required
                            >
                                <option value="">-- Firma Seçiniz --</option>
                                {forwarders.map((f) => (
                                    <option key={f.id} value={f.name}>
                                        {f.name}
                                    </option>
                                ))}
                                <option value="__NEW__" className="font-bold text-sky-600">
                                    ➕ Yeni Firma Ekle (Listede Yoksa)
                                </option>
                            </select>
                        </div>

                        {/* Yeni Firma Açılan Giriş Alanı */}
                        {selectedShipperOption === '__NEW__' && (
                            <div className="space-y-1.5 animate-in fade-in-50 duration-200 bg-sky-50/60 p-3.5 rounded-lg border border-sky-200">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                                        <span className="inline-block w-2 h-2 rounded-full bg-sky-600"></span>
                                        Yeni Firma Ünvanı / Adı *
                                    </Label>
                                    <span className="text-[11px] text-sky-700 font-semibold bg-sky-100 px-2 py-0.5 rounded">
                                        Yeni Cari Kaydı
                                    </span>
                                </div>
                                <Input
                                    placeholder="Yeni firma / cari adını giriniz (Örn: ABC ULUSLARARASI LOJİSTİK A.Ş.)"
                                    value={newShipperName}
                                    onChange={(e) => handleNewShipperNameChange(e.target.value)}
                                    className="border-slate-300 bg-white text-slate-800"
                                    autoFocus
                                    required
                                />
                                <p className="text-[11px] text-slate-500">
                                    Girdiğiniz firma rezervasyonunuza yeni cari firma olarak kaydedilecektir.
                                </p>
                            </div>
                        )}

                        {/* Yetkili Adı & Soyadı */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Yetkili Adı *</Label>
                                <Input
                                    placeholder="Ahmet"
                                    value={bookingForm.data.contactName}
                                    onChange={(e) => bookingForm.setData('contactName', e.target.value)}
                                    className="border-slate-300 bg-white text-slate-800"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Yetkili Soyadı *</Label>
                                <Input
                                    placeholder="Veli"
                                    value={bookingForm.data.contactSurname}
                                    onChange={(e) => bookingForm.setData('contactSurname', e.target.value)}
                                    className="border-slate-300 bg-white text-slate-800"
                                    required
                                />
                            </div>
                        </div>

                        {/* Yetkili Mail & Telefon */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Yetkili Mail *</Label>
                                <Input
                                    type="email"
                                    placeholder="mail@mail.com"
                                    value={bookingForm.data.contactMail}
                                    onChange={(e) => bookingForm.setData('contactMail', e.target.value)}
                                    className="border-slate-300 bg-white text-slate-800"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Yetkili Telefon *</Label>
                                <Input
                                    placeholder="0555 555 5555"
                                    value={bookingForm.data.contactPhone}
                                    onChange={(e) => bookingForm.setData('contactPhone', e.target.value)}
                                    className="border-slate-300 bg-white text-slate-800"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-slate-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setReservationOpen(false)}
                                className="text-slate-700 border-slate-300"
                            >
                                İptal
                            </Button>
                            <Button
                                type="button"
                                onClick={handleStep1Submit}
                                className="bg-[#2e7d32] hover:bg-[#256629] text-white font-bold"
                            >
                                Kaydet ve Araç Sürücü Bilgileri Gir ➔
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* SÜRÜCÜ VE ARAÇ BİLGİLERİ (ADIM 2 / 2 SUBMODAL) */}
            <Dialog open={subStep2Open} onOpenChange={setSubStep2Open}>
                <DialogContent className="max-w-2xl bg-white text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Truck className="h-5 w-5 text-emerald-600" /> Sürücü ve Araç Bilgileri (Ön Rezervasyon Adım 2 / 2)
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleOpenPreBookingNotice} className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Sürücü Ad & Soyad *</Label>
                                <Input
                                    placeholder="Mehmet Veli"
                                    value={bookingForm.data.driverName}
                                    onChange={(e) => bookingForm.setData('driverName', e.target.value)}
                                    className="border-slate-300 bg-white text-slate-800"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Sürücü Telefon *</Label>
                                <Input
                                    placeholder="0555 555 5555"
                                    value={bookingForm.data.driverPhone}
                                    onChange={(e) => bookingForm.setData('driverPhone', e.target.value)}
                                    className="border-slate-300 bg-white text-slate-800"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Çekici Plaka *</Label>
                                <Input
                                    placeholder="34 ASB 25"
                                    value={bookingForm.data.truckPlate}
                                    onChange={(e) => bookingForm.setData('truckPlate', e.target.value.toUpperCase())}
                                    className="border-slate-300 bg-white text-slate-800 font-mono uppercase"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Tonaj (Ton)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={bookingForm.data.weightTon}
                                    onChange={(e) => bookingForm.setData('weightTon', parseFloat(e.target.value) || 0)}
                                    className="border-slate-300 bg-white text-slate-800 font-mono"
                                    placeholder="24.5"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Araç Cinsi</Label>
                                <select
                                    value={bookingForm.data.vehicleKind}
                                    onChange={(e) => bookingForm.setData('vehicleKind', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-xs"
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

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Dorse Tipi</Label>
                                <select
                                    value={bookingForm.data.trailerType}
                                    onChange={(e) => bookingForm.setData('trailerType', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-xs"
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
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Elektrik</Label>
                                <select
                                    value={bookingForm.data.hasElectricity}
                                    onChange={(e) => bookingForm.setData('hasElectricity', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-xs"
                                >
                                    <option value="0">Yok (Kuru Yük)</option>
                                    <option value="1">Var (Elektrikli / Soğutucu)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Dorse Plakası (Opsiyonel)</Label>
                                <Input
                                    placeholder="34 TR 123"
                                    value={bookingForm.data.trailerPlate}
                                    onChange={(e) => bookingForm.setData('trailerPlate', e.target.value.toUpperCase())}
                                    className="border-slate-300 bg-white text-slate-800 font-mono uppercase"
                                />
                            </div>
                        </div>

                        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2.5">
                            <span className="text-base leading-none">⏳</span>
                            <div>
                                <span className="font-semibold">Ön Rezervasyon Bilgilendirmesi:</span>
                                <p className="mt-0.5 text-[11px] text-slate-600">
                                    Ön rezervasyon talebiniz doğrudan operasyon onay listesine düşecektir. Ödeme tipi ve evrak onayı tamamlandıktan sonra biniş kartınız hazır olacaktır.
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-slate-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSubStep2Open(false)}
                                className="text-slate-700 border-slate-300"
                            >
                                Geri
                            </Button>
                            <Button
                                type="submit"
                                disabled={bookingForm.processing}
                                className="bg-[#2e7d32] hover:bg-[#256629] text-white font-bold"
                            >
                                {bookingForm.processing ? 'İşleniyor...' : 'Ön Rezervasyonu Onayla ve Bitir'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Ön Rezervasyon Bilgilendirme ve Onay Diyaloğu (Landing) */}
            <Dialog open={preBookingNoticeOpen} onOpenChange={setPreBookingNoticeOpen}>
                <DialogContent className="max-w-md md:max-w-lg bg-white text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold text-amber-800">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-black">!</span>
                            Ön Rezervasyon Bilgilendirmesi & Onay
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-1">
                        {/* Belirgin Deklarasyon Kutusu */}
                        <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4 text-amber-950 space-y-3 shadow-xs">
                            <div className="flex items-center gap-2 font-extrabold text-sm text-amber-900">
                                DİKKAT: BU BİR ÖN REZERVASYONDUR
                            </div>
                            <p className="text-xs md:text-sm leading-relaxed font-semibold text-slate-800">
                                Bu bir ön rezervasyondur. Ödeme onayı ve evrak girişleri tamamlandıktan sonra ve operasyonel bir engel olmadığında rezervasyonunuz kesin olarak onaylanır.
                            </p>
                            <div className="rounded-lg bg-white p-3 border border-amber-300 flex items-start gap-2.5">
                                <Mail className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-slate-800 leading-snug">
                                    Rezervasyonunuz onaylandığında tarafınıza <strong className="text-emerald-700">{bookingForm.data.contactMail || 'kayıtlı e-posta'}</strong> adresiniz üzerinden <span className="underline font-semibold">mail ile bildirim yapacağız.</span>
                                </p>
                            </div>
                        </div>

                        {/* Özet Bilgiler */}
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-2">
                            <div className="flex justify-between items-center text-slate-600 pb-1.5 border-b border-slate-200">
                                <span>Taşıyıcı / Firma:</span>
                                <span className="font-semibold text-slate-900">{bookingForm.data.shipper}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600 pb-1.5 border-b border-slate-200">
                                <span>Çekici Plakası:</span>
                                <span className="font-mono font-bold text-slate-900">{bookingForm.data.truckPlate}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Sürücü / Telefon:</span>
                                <span className="font-medium text-slate-900">{bookingForm.data.driverName} ({bookingForm.data.driverPhone})</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-3 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPreBookingNoticeOpen(false)}
                            disabled={bookingForm.processing}
                            className="text-slate-700 border-slate-300"
                        >
                            Geri Dön / Düzenle
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmPreBookingSubmit}
                            disabled={bookingForm.processing}
                            className="bg-[#2e7d32] hover:bg-[#256629] text-white font-bold"
                        >
                            {bookingForm.processing ? 'Gönderiliyor...' : 'Anladım, Ön Rezervasyonu Tamamla'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 2. SEFERLER MODALI */}
            <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <DialogContent className="max-w-4xl bg-white text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Ship className="h-5 w-5 text-sky-600" /> Güncel Cenk Ro-Ro Seferleri
                        </DialogTitle>
                        <p className="text-xs text-slate-500">
                            Akdeniz ve Karadeniz düzenli Ro-Ro hatları kalkış & varış çizelgesi
                        </p>
                    </DialogHeader>

                    <div className="overflow-x-auto max-h-[60vh] border rounded-lg border-slate-200">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="font-bold text-slate-700">Sefer Kodu</TableHead>
                                    <TableHead className="font-bold text-slate-700">Gemi Adı</TableHead>
                                    <TableHead className="font-bold text-slate-700">Güzergah</TableHead>
                                    <TableHead className="font-bold text-slate-700">Kalkış</TableHead>
                                    <TableHead className="font-bold text-slate-700">Varış</TableHead>
                                    <TableHead className="font-bold text-slate-700">Rıhtım</TableHead>
                                    <TableHead className="text-right font-bold text-slate-700">İşlem</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {voyages.map((voyage) => (
                                    <TableRow key={voyage.id} className="hover:bg-slate-50">
                                        <TableCell className="font-mono font-bold text-sky-600">
                                            {voyage.id}
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-900">
                                            {voyage.vesselName}
                                        </TableCell>
                                        <TableCell className="font-medium text-emerald-700">
                                            {voyage.route}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-600">
                                            {voyage.departureTime}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-600">
                                            {voyage.estimatedArrival}
                                        </TableCell>
                                        <TableCell className="text-xs font-mono text-slate-600">
                                            {voyage.berth}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSelectVoyageAndBook(voyage.id)}
                                                className="bg-[#2e7d32] hover:bg-[#256629] text-white text-xs font-bold"
                                            >
                                                Rezervasyon Yap
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 3. FİYAT LİSTESİ MODALI */}
            <Dialog open={tariffOpen} onOpenChange={setTariffOpen}>
                <DialogContent className="max-w-4xl bg-white text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-amber-600" /> Navlun ve Fiyat Tarifeleri
                        </DialogTitle>
                        <p className="text-xs text-slate-500">
                            Standart araç, dorse ve özel yük taşıma tarifeleri
                        </p>
                    </DialogHeader>

                    <div className="overflow-x-auto max-h-[60vh] border rounded-lg border-slate-200">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="font-bold text-slate-700">Kategori</TableHead>
                                    <TableHead className="font-bold text-slate-700">Güzergah</TableHead>
                                    <TableHead className="font-bold text-slate-700">Maks Boy / Tonaj</TableHead>
                                    <TableHead className="font-bold text-slate-700">Baz Navlun</TableHead>
                                    <TableHead className="font-bold text-slate-700">BAF Yakıt</TableHead>
                                    <TableHead className="font-bold text-slate-700">ISPS Güvenlik</TableHead>
                                    <TableHead className="font-bold text-slate-700">Lashing / Kantar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tariffs.map((t) => (
                                    <TableRow key={t.id} className="hover:bg-slate-50">
                                        <TableCell className="font-semibold text-slate-900">
                                            {t.category}
                                        </TableCell>
                                        <TableCell className="text-slate-700 text-xs">
                                            {t.route || 'Tüm Hatlar'}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-slate-600">
                                            {t.maxLengthMeters}m / {t.maxGrossWeightTon}T
                                        </TableCell>
                                        <TableCell className="font-mono font-bold text-sky-600">
                                            {t.currency === 'EUR' ? '€' : '$'}
                                            {Number(t.basePriceUsd).toLocaleString('tr-TR')}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-slate-600">
                                            +${t.bafFuelSurchargeUsd || 95}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-slate-600">
                                            +${t.ispsSecurityFeeUsd || 45}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 text-[10px] font-bold">
                                                ✓ Dahil
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 4. FİLOMUZ MODALI */}
            <Dialog open={fleetOpen} onOpenChange={setFleetOpen}>
                <DialogContent className="max-w-4xl bg-white text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Anchor className="h-5 w-5 text-indigo-600" /> Cenk Ro-Ro Filosu
                        </DialogTitle>
                        <p className="text-xs text-slate-500">
                            Karadeniz ve Akdeniz&apos;de kesintisiz lojistik sağlayan modern filomuz
                        </p>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[65vh] overflow-y-auto p-1">
                        {vessels.map((v) => (
                            <div
                                key={v.id}
                                className="rounded-lg border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow bg-slate-50/50"
                            >
                                <div className="h-32 bg-[#05264b] relative overflow-hidden flex items-center justify-center text-sky-400">
                                    <Ship className="h-14 w-14 opacity-30" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#05264b] to-transparent" />
                                    <span className="absolute bottom-2 left-3 text-xs font-mono text-sky-300">
                                        {v.id}
                                    </span>
                                </div>
                                <div className="p-4 space-y-2">
                                    <h4 className="font-bold text-base text-slate-900">{v.name}</h4>
                                    <div className="text-xs text-slate-500">
                                        IMO: {v.imo || '9123456'} • Bayrak: {v.flag || 'TUR'}
                                    </div>
                                    <div className="space-y-1 pt-2 border-t border-slate-200 text-xs text-slate-700">
                                        <div className="flex justify-between">
                                            <span>Toplam Şerit (LM):</span>
                                            <strong className="font-mono text-sky-600">{v.laneMeters} LM</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Seyir Hızı:</span>
                                            <strong>{v.speedKnots || 16} Knot</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>İnşa Yılı:</span>
                                            <strong>{v.builtYear || 2012}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* 5. PNR & BİLET SORGULAMA MODALI */}
            <Dialog open={pnrOpen} onOpenChange={setPnrOpen}>
                <DialogContent className="max-w-2xl bg-white text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Search className="h-5 w-5 text-teal-600" /> PNR & Bilet Sorgulama
                        </DialogTitle>
                        <p className="text-xs text-slate-500">
                            Rezervasyon numarası (PNR) veya araç plakanız ile bilet durumunu sorgulayın
                        </p>
                    </DialogHeader>

                    <form onSubmit={handlePnrSearch} className="flex gap-2 pt-2">
                        <Input
                            placeholder="Örn: BK-2026-6418 veya 34 ASB 25"
                            value={searchPnrInput}
                            onChange={(e) => setSearchPnrInput(e.target.value)}
                            className="font-mono text-sm border-slate-300 bg-white text-slate-800"
                            required
                        />
                        <Button type="submit" className="bg-[#2e7d32] hover:bg-[#256629] text-white font-bold">
                            Sorgula
                        </Button>
                    </form>

                    {searchResult ? (
                        <div className="rounded-lg border-2 border-sky-400 bg-sky-50/50 p-5 mt-4 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        ÖN REZERVASYON NO (PNR)
                                    </div>
                                    <div className="font-mono text-xl font-black text-sky-700">
                                        {searchResult.id}
                                    </div>
                                </div>
                                <Badge className={searchResult.paymentStatus === 'PAID' ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold" : "bg-amber-100 text-amber-800 border-amber-300 font-bold"}>
                                    {searchResult.paymentStatus === 'PAID' ? '✓ Tescilli Bilet' : '📝 Ön Rezervasyon Kaydı'}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                                <div>🏢 <strong>Firma:</strong> {searchResult.shipper}</div>
                                <div>👤 <strong>Yetkili:</strong> {searchResult.contactName} {searchResult.contactSurname}</div>
                                <div>🚚 <strong>Plaka:</strong> <span className="font-mono font-bold text-slate-900">{searchResult.truckPlate}</span></div>
                                <div>👨‍✈️ <strong>Sürücü:</strong> {searchResult.driverName}</div>
                                <div>🚢 <strong>Sefer:</strong> {searchResult.voyageId}</div>
                                <div>📦 <strong>Araç:</strong> {searchResult.vehicleKind} ({searchResult.weightTon} Ton)</div>
                                <div>⚡ <strong>Elektrik:</strong> {searchResult.hasElectricity ? 'Var' : 'Yok'}</div>
                                <div>
                                    💳 <strong>Ödeme Durumu:</strong>{' '}
                                    {searchResult.paymentStatus === 'PAID' ? (
                                        <span className="text-emerald-700 font-bold">✓ Ödendi</span>
                                    ) : (
                                        <span className="text-amber-700 font-bold">⏳ Onay Bekleniyor ({searchResult.paymentMethod || 'Belirlenmedi'})</span>
                                    )}
                                </div>
                            </div>

                            {(() => {
                                const isPrintBlocked = searchResult.bookingChannel === 'Web' && searchResult.paymentStatus !== 'PAID';

                                if (isPrintBlocked) {
                                    return (
                                        <div className="space-y-3 pt-3 border-t border-slate-200">
                                            {/* Belirgin Ön Rezervasyon Uyarı Kutusu */}
                                            <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4 text-amber-950 space-y-2.5 shadow-xs">
                                                <div className="flex items-center gap-2 font-extrabold text-sm text-amber-900">
                                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-black">!</span>
                                                    DİKKAT: BU BİR ÖN REZERVASYONDUR
                                                </div>
                                                <p className="text-xs sm:text-sm leading-relaxed font-semibold text-slate-800">
                                                    Bu bir ön rezervasyondur. Ödeme onayı ve evrak girişleri tamamlandıktan sonra ve operasyonel bir engel olmadığında rezervasyonunuz kesin olarak onaylanır.
                                                </p>
                                                <div className="rounded-lg bg-white p-2.5 border border-amber-300 flex items-start gap-2.5">
                                                    <Mail className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                                                    <p className="text-xs font-medium text-slate-800 leading-snug">
                                                        Rezervasyonunuz onaylandığında kayıtlı <strong className="text-emerald-700">{searchResult.contactMail || 'e-posta'}</strong> adresinize <span className="underline font-semibold">mail ile bildirim yapacağız</span> ve biniş kartı yazdırma izni aktifleşecektir.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    disabled
                                                    className="inline-flex items-center gap-1.5 rounded-md bg-slate-200 text-slate-500 px-3.5 py-2 text-xs font-semibold cursor-not-allowed shrink-0"
                                                    title="Ödeme ve evrak onayı verilene kadar biniş kartı yazdırılamaz"
                                                >
                                                    <Lock className="h-3.5 w-3.5 text-amber-600" /> Biniş Kartı Kilitli (Ön Rezervasyon Onayı Bekleniyor)
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="flex justify-end pt-3 border-t border-slate-200">
                                        <a
                                            href={`/bookings/boarding-pass/${searchResult.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-md bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-700 transition-colors"
                                        >
                                            <Printer className="h-3.5 w-3.5" /> Biniş Kartını Yazdır (PDF)
                                        </a>
                                    </div>
                                );
                            })()}
                        </div>
                    ) : pnrQuery ? (
                        <div className="rounded-md border border-rose-300 bg-rose-50 p-4 text-center text-xs text-rose-700 mt-4">
                            ❌ &apos;{pnrQuery}&apos; aramasıyla eşleşen rezervasyon kaydı bulunamadı.
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* 6. HAKKIMIZDA MODALI */}
            <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
                <DialogContent className="max-w-xl bg-white text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Info className="h-5 w-5 text-sky-600" /> Cenk Group & Ro-Ro Taşımacılığı
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 pt-2 text-sm text-slate-700 leading-relaxed">
                        <p>
                            Cenk Group, deniz taşımacılığı alanında yarım asrı aşkın tecrübesiyle Türkiye, Karadeniz ve
                            Akdeniz limanları arasında güvenli, dakik ve düzenli Ro-Ro hatları işletmektedir.
                        </p>
                        <p>
                            Yüksek hat kapasitesine sahip gemilerimizle; komple çekici-yarı römork (TIR), dorse, binek araç,
                            iş makinesi, gabari dışı proje yükleri ve soğutuculu (frigo) taşımalarda kesintisiz deniz köprüsü sağlamaktayız.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 7. İLETİŞİM MODALI */}
            <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                <DialogContent className="max-w-xl bg-white text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-rose-600" /> İletişim & Liman Acenteleri
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 pt-2 text-sm text-slate-700">
                        <div className="flex items-start gap-2.5">
                            <MapPin className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                            <div>
                                <strong>Genel Merkez:</strong> Cenk Denizcilik ve Ticaret A.Ş., İstanbul / Türkiye
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <Anchor className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                            <div>
                                <strong>Haydarpaşa Terminali:</strong> Haydarpaşa Ro-Ro Rıhtım No: 4
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <Anchor className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                            <div>
                                <strong>Karasu Terminali:</strong> Karasu Liman Sahası, Sakarya
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <Phone className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                            <div>
                                <strong>7/24 Operasyon Masası:</strong> +90 (216) 555 0000
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <Mail className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                            <div>
                                <strong>E-Posta:</strong> info@cenkroro.com / reservation@cenkroro.com
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
