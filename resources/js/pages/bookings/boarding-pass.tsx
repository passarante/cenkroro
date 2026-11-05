import { Booking } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Globe, Lock, Monitor, Printer, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BoardingPassProps {
    booking: Booking;
}

export default function BoardingPass({ booking }: BoardingPassProps) {
    if (booking.bookingChannel === 'Web' && booking.paymentStatus !== 'PAID') {
        return (
            <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center text-foreground">
                <Head title="Biniş Kartı - Ödeme Bekleniyor" />
                <div className="max-w-md w-full rounded-xl border border-amber-500/30 bg-slate-900 p-6 text-center space-y-4 shadow-xl">
                    <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-500 mx-auto">
                        <Lock className="h-10 w-10" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Ödeme Onayı Bekleniyor</h2>
                    <p className="text-sm text-slate-300">
                        Bu web rezervasyonuna (<strong>{booking.id}</strong>) ait biniş kartı, banka/finans ödeme onayı verilene kadar görüntülenemez ve yazdırılamaz.
                    </p>
                    <div className="pt-2">
                        <Button asChild variant="outline" className="border-slate-700 hover:bg-slate-800 text-white">
                            <Link href="/portal?tab=pnr">PNR Sorgulamaya Dön</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex flex-col items-center justify-start text-foreground">
            <Head title={`Biniş Kartı - ${booking.truckPlate} (${booking.id})`} />

            {/* Print & Back Controls (Hidden in Print) */}
            <div className="w-full max-w-[850px] mb-4 flex items-center justify-between print:hidden">
                <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white">
                    <Link href="/bookings">
                        <ArrowLeft className="mr-1.5 h-4 w-4" /> Rezervasyon Masasına Dön
                    </Link>
                </Button>
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
                    <Printer className="mr-1.5 h-4 w-4" /> Biniş Kartını Yazdır (Print)
                </Button>
            </div>

            {/* Official Boarding Pass Ticket */}
            <div className="w-full max-w-[850px] rounded-xl overflow-hidden border-2 border-blue-600 bg-white text-slate-900 shadow-2xl print:border print:shadow-none print:w-full print:rounded-none">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-sky-900 text-white p-5 md:p-6 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <div className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                            <span>CENK GROUP RO-RO</span>
                        </div>
                        <div className="text-xs text-sky-200 uppercase tracking-wider font-semibold mt-0.5">
                            Official Boarding Pass & Terminal Security Clearance
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-mono text-xl md:text-2xl font-black text-amber-300">
                            {booking.id}
                        </div>
                        <div className="mt-1">
                            {booking.bookingChannel === 'Web' ? (
                                <span className="inline-flex items-center gap-1 rounded bg-white/20 px-2 py-0.5 text-xs font-bold text-white">
                                    <Globe className="h-3 w-3" /> Web Rezervasyonu
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded bg-white/20 px-2 py-0.5 text-xs font-bold text-white">
                                    <Monitor className="h-3 w-3" /> Platform Rezervasyonu
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column (2 Cols on desktop) */}
                    <div className="md:col-span-2 space-y-4">
                        {/* Sefer Bilgileri Box */}
                        <div className="rounded-lg border border-sky-200 bg-sky-50/70 p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        SEFER NO & GEMİ
                                    </div>
                                    <div className="font-mono font-extrabold text-blue-800 text-base">
                                        {booking.voyageId || 'VOY-081'}
                                    </div>
                                    <div className="text-xs font-semibold text-slate-700 mt-0.5">
                                        {booking.voyage?.vesselName || 'M/V CENK T'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        GÜZERGAH & RIHTIM
                                    </div>
                                    <div className="font-bold text-slate-900 text-sm">
                                        {booking.voyage?.route || 'Pendik ➔ Trieste'}
                                    </div>
                                    <div className="text-xs font-medium text-slate-600 mt-0.5">
                                        Rıhtım: {booking.voyage?.berth || 'Rıhtım 1'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Araç & Sürücü Box */}
                        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        ÇEKİCİ PLAKA
                                    </div>
                                    <div className="font-mono font-black text-xl text-blue-700">
                                        {booking.truckPlate}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        DORSE PLAKA
                                    </div>
                                    <div className="font-mono font-black text-xl text-slate-800">
                                        {booking.trailerPlate || 'YALNIZ ÇEKİCİ'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        SÜRÜCÜ BİLGİSİ
                                    </div>
                                    <div className="text-sm font-bold text-slate-900">
                                        {booking.driverName || 'Belirtilmedi'}
                                    </div>
                                    <div className="font-mono text-xs text-slate-600">
                                        {booking.driverPhone || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        LOJİSTİK FİRMASI
                                    </div>
                                    <div className="text-sm font-bold text-slate-900">
                                        {booking.shipper}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Yük & Ebat Bilgileri */}
                        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 grid grid-cols-3 gap-3 text-center">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    KATEGORİ
                                </div>
                                <div className="font-bold text-slate-900 text-sm mt-0.5">
                                    {booking.category}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    UZUNLUK (LM)
                                </div>
                                <div className="font-mono font-extrabold text-slate-900 text-sm mt-0.5">
                                    {booking.lengthMeters} m
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    AĞIRLIK
                                </div>
                                <div className="font-mono font-extrabold text-slate-900 text-sm mt-0.5">
                                    {booking.weightTon} Ton
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: QR Security & Approval */}
                    <div className="border-t md:border-t-0 md:border-l-2 md:border-dashed md:border-slate-300 md:pl-6 flex flex-col justify-between items-center text-center">
                        <div className="w-full space-y-2">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                GÜVENLİK QR DOĞRULAMA
                            </div>

                            {/* Simulated High-Res QR Matrix */}
                            <div className="w-36 h-36 mx-auto bg-slate-950 p-2.5 rounded-lg shadow-sm flex flex-col items-center justify-center text-white">
                                <div className="w-full h-full bg-white p-1.5 rounded flex flex-col items-center justify-between text-slate-950 font-mono text-[8px] leading-tight">
                                    <div className="font-black text-[11px] text-blue-900">CENK RO-RO</div>
                                    <QrCode className="h-12 w-12 text-slate-900" />
                                    <div className="font-black text-[10px]">{booking.truckPlate}</div>
                                    <div className="font-bold text-[7px] text-emerald-700">✓ TESCİLLİ BİNİŞ</div>
                                </div>
                            </div>
                            <div className="font-mono text-[11px] font-semibold text-slate-600">
                                MRN: {booking.mrnNumber || '26TR34000000000A'}
                            </div>
                        </div>

                        <div className="w-full rounded-md border border-emerald-300 bg-emerald-50 p-2.5 my-3">
                            <div className="flex items-center justify-center gap-1 text-emerald-700 font-extrabold text-xs">
                                <CheckCircle2 className="h-4 w-4" /> GEMİYE BİNİŞ ONAYLANDI
                            </div>
                            <div className="text-[10px] font-medium text-emerald-800 mt-0.5">
                                Gümrük: {booking.customsStatus || 'Beklemede (YNS)'}
                            </div>
                        </div>

                        <div className="text-[9px] text-slate-400 italic">
                            Bu belge resmi Ro-Ro taşıma senedi ve liman terminal kapı geçiş belgesidir.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
