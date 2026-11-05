import { Booking, Voyage } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OfficialManifestProps {
    voyage: Voyage;
    bookings: Booking[];
    totalGrossWeight: number;
    totalWeightKg: number;
    totalLM: number;
    manifestNo: string;
    bilgeNo: string;
}

export default function OfficialManifest({
    voyage,
    bookings = [],
    totalGrossWeight = 0,
    totalWeightKg = 0,
    manifestNo,
    bilgeNo,
}: OfficialManifestProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex flex-col items-center justify-start text-foreground">
            <Head title={`Resmi Yük Manifestosu - ${voyage.id}`} />

            {/* Back & Print Bar (Hidden on print) */}
            <div className="w-full max-w-[1050px] mb-4 flex items-center justify-between print:hidden">
                <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white">
                    <Link href="/customs">
                        <ArrowLeft className="mr-1.5 h-4 w-4" /> Gümrük Masasına Dön
                    </Link>
                </Button>
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
                    <Printer className="mr-1.5 h-4 w-4" /> Resmi Manifestoyu Yazdır (A4 Yatay / PDF)
                </Button>
            </div>

            {/* Official Manifest Sheet */}
            <div className="w-full max-w-[1050px] bg-white text-slate-950 p-6 md:p-8 rounded-lg shadow-2xl border border-slate-300 print:shadow-none print:border-none print:w-full print:p-0">
                {/* Official Header */}
                <div className="border-b-2 border-slate-950 pb-3 mb-4 flex justify-between items-start">
                    <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-wide text-slate-700">
                            T.C. TİCARET BAKANLIĞI GÜMRÜKLER GENEL MÜDÜRLÜĞÜ
                        </div>
                        <h1 className="text-xl font-black text-slate-950 my-1">
                            DENİZYOLU RO-RO YÜK VE TAŞIMA MANİFESTOSU (FORM-10)
                        </h1>
                        <div className="text-[11px] text-slate-600">
                            İSTANBUL RO-RO GÜMRÜK MÜDÜRLÜĞÜ • UN/EDIFACT CUSCAR / BİLGE ENTEGRASYONU
                        </div>
                    </div>
                    <div className="text-right font-mono">
                        <div className="text-sm font-black text-blue-900">MANİFESTO NO: {manifestNo}</div>
                        <div className="text-xs font-semibold text-slate-700">BİLGE TESCİL: {bilgeNo}</div>
                        <div className="text-[10px] text-slate-500">
                            TARİH: {new Date().toLocaleDateString('tr-TR')} {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>

                {/* Vessel & Voyage Specs Table */}
                <table className="w-full border-collapse border border-slate-900 text-xs mb-4">
                    <tbody>
                        <tr className="border-b border-slate-900">
                            <td className="p-2 border-r border-slate-900 bg-slate-50 w-1/4">
                                <strong>Gemi Adı & Bayrak:</strong> {voyage.vesselName} (TR 🇹🇷)
                            </td>
                            <td className="p-2 border-r border-slate-900 bg-slate-50 w-1/4">
                                <strong>IMO / Çağrı İşareti:</strong> 9874211 / TCZK
                            </td>
                            <td className="p-2 border-r border-slate-900 bg-slate-50 w-1/4">
                                <strong>Kalkış Limanı:</strong> {voyage.departurePort}
                            </td>
                            <td className="p-2 bg-slate-50 w-1/4">
                                <strong>Varış Limanı:</strong> {voyage.arrivalPort}
                            </td>
                        </tr>
                        <tr className="border-b border-slate-900">
                            <td className="p-2 border-r border-slate-900">
                                <strong>Donatan / İşleten:</strong> Cenk Denizcilik ve Tic. A.Ş.
                            </td>
                            <td className="p-2 border-r border-slate-900">
                                <strong>Acente:</strong> Samer Seaports / Cenk Agency
                            </td>
                            <td className="p-2 border-r border-slate-900">
                                <strong>Kalkış Zamanı:</strong> {voyage.departureTime}
                            </td>
                            <td className="p-2">
                                <strong>Tahmini Varış:</strong> {voyage.estimatedArrival}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} className="p-2 border-r border-slate-900 font-semibold">
                                Toplam Yüklü Araç: {bookings.length} Treyler / Komple TIR
                            </td>
                            <td colSpan={2} className="p-2 font-semibold">
                                Toplam Brüt Yük Ağırlığı: {Number(totalGrossWeight).toFixed(1)} Ton ({Number(totalWeightKg).toLocaleString('tr-TR')} kg)
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Cargo Table */}
                <table className="w-full border-collapse border border-slate-900 text-[11px] mb-6">
                    <thead>
                        <tr className="bg-slate-100 border-b border-slate-900 font-bold">
                            <th className="p-1.5 border-r border-slate-900 text-center w-8">No</th>
                            <th className="p-1.5 border-r border-slate-900 text-left">MRN / Tescil No</th>
                            <th className="p-1.5 border-r border-slate-900 text-left">Bilet No</th>
                            <th className="p-1.5 border-r border-slate-900 text-left">Çekici Plaka</th>
                            <th className="p-1.5 border-r border-slate-900 text-left">Dorse Plaka</th>
                            <th className="p-1.5 border-r border-slate-900 text-left">Taşıyıcı Firma</th>
                            <th className="p-1.5 border-r border-slate-900 text-left">Eşya Tanımı (Kargo)</th>
                            <th className="p-1.5 border-r border-slate-900 text-right">Ağırlık (kg)</th>
                            <th className="p-1.5 text-center">Hat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b, idx) => (
                            <tr key={b.id} className="border-b border-slate-900">
                                <td className="p-1.5 border-r border-slate-900 text-center font-bold">{idx + 1}</td>
                                <td className="p-1.5 border-r border-slate-900 font-mono font-bold">{b.mrnNumber || `26TR3400000${1000 + idx}A`}</td>
                                <td className="p-1.5 border-r border-slate-900 font-mono">{b.id}</td>
                                <td className="p-1.5 border-r border-slate-900 font-mono font-black">{b.truckPlate}</td>
                                <td className="p-1.5 border-r border-slate-900 font-mono">{b.trailerPlate || '-'}</td>
                                <td className="p-1.5 border-r border-slate-900 font-semibold">{b.shipper}</td>
                                <td className="p-1.5 border-r border-slate-900">{b.cargoDescription || 'Genel Ticari Kargo'}</td>
                                <td className="p-1.5 border-r border-slate-900 font-mono font-bold text-right">
                                    {Number(b.weightTon * 1000).toLocaleString('tr-TR')}
                                </td>
                                <td className="p-1.5 text-center font-bold">
                                    <span
                                        className={
                                            b.customsStatus?.includes('Yeşil')
                                                ? 'text-emerald-700'
                                                : b.customsStatus?.includes('Sarı')
                                                ? 'text-amber-700'
                                                : 'text-red-700'
                                        }
                                    >
                                        {b.customsStatus?.includes('Yeşil')
                                            ? 'YEŞİL'
                                            : b.customsStatus?.includes('Sarı')
                                            ? 'SARI'
                                            : 'KIRMIZI'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Signatures & Legal Stamps */}
                <div className="grid grid-cols-3 gap-6 pt-4 text-xs">
                    <div className="border border-slate-900 p-3 h-24 text-center flex flex-col justify-between">
                        <div className="font-bold">GEMİ KAPTANI</div>
                        <div className="text-[10px] text-slate-600">Kpt. Burak ÇELİK</div>
                        <div className="text-[9px] text-slate-400">İmza & Gemi Mührü</div>
                    </div>

                    <div className="border border-slate-900 p-3 h-24 text-center flex flex-col justify-between">
                        <div className="font-bold">RO-RO OPERASYON MÜDÜRÜ</div>
                        <div className="text-[10px] text-slate-600">Cenk Group Terminal Başkontrolör</div>
                        <div className="text-[9px] text-slate-400">İmza & Kaşe</div>
                    </div>

                    <div className="border border-slate-900 p-3 h-24 text-center flex flex-col justify-between">
                        <div className="font-bold">GÜMRÜK MUAYENE MEMURU</div>
                        <div className="text-[10px] text-slate-600">T.C. Gümrük Tescil Onayı</div>
                        <div className="text-[9px] text-slate-400">Resmi Mühür / Paraf</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
