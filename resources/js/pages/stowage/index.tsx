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
import { Booking, DeckConfiguration, Vessel, Voyage } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronUp,
    Layers,
    RotateCcw,
    Ship,
    Truck,
    X,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface StowageIndexProps {
    vessels: Vessel[];
    currentVessel: Vessel;
    activeVoyage?: Voyage | null;
    selectedDeckKey: string;
    allDeckKeys: string[];
    currentDeck: {
        name?: string;
        clearHeight?: number;
        maxWeightTon?: number;
        hasFrigoPlugs?: boolean;
        lanes: Array<{
            laneNo?: number;
            lane?: number;
            capacityLM?: number;
            lengthM?: number;
            maxTrailers?: number;
        }>;
        stowedUnits: Array<{
            bookingId: string;
            plate: string;
            shipper?: string;
            category?: string;
            lengthM: number;
            weightTon: number;
            isReefer?: boolean;
            isAdr?: boolean;
            deck?: string;
            lane?: number;
            slot?: number;
        }>;
    };
    deckLanesWithUnits: Array<{
        lane: {
            laneNo?: number;
            lane?: number;
            capacityLM?: number;
            lengthM?: number;
            maxTrailers?: number;
        };
        units: Array<{
            bookingId: string;
            plate: string;
            shipper?: string;
            category?: string;
            lengthM: number;
            weightTon: number;
            isReefer?: boolean;
            isAdr?: boolean;
            deck?: string;
            lane?: number;
            slot?: number;
        }>;
        usedLM: number;
        usedTon: number;
        percent: number;
    }>;
    unstowedQueue: Booking[];
    totalDeckUsedLM: number;
    totalDeckUsedTon: number;
    totalDeckCapacityLM: number;
}

export default function StowageIndex({
    vessels = [],
    currentVessel,
    activeVoyage,
    selectedDeckKey = 'Main Deck',
    allDeckKeys = [],
    currentDeck,
    deckLanesWithUnits = [],
    unstowedQueue = [],
    totalDeckUsedLM = 0,
    totalDeckUsedTon = 0,
    totalDeckCapacityLM = 0,
}: StowageIndexProps) {
    // Selected lanes state for each queued vehicle
    const [selectedLanes, setSelectedLanes] = useState<Record<string, number>>({});

    const handleStow = (bookingId: string) => {
        const firstLane = currentDeck?.lanes[0]?.laneNo ?? 1;
        const targetLane = selectedLanes[bookingId] ?? firstLane;

        router.post(
            '/stowage/stow',
            {
                vesselId: currentVessel.id,
                deckKey: selectedDeckKey,
                bookingId,
                lane: targetLane,
            },
            {
                onSuccess: () => toast.success('Araç şeride yerleştirildi.'),
                onError: () => toast.error('Yerleştirme sırasında hata oluştu.'),
            }
        );
    };

    const handleUnstow = (bookingId: string) => {
        router.post(
            '/stowage/unstow',
            {
                vesselId: currentVessel.id,
                deckKey: selectedDeckKey,
                bookingId,
            },
            {
                onSuccess: () => toast.info('Araç şeritten indirildi ve bekleme kuyruğuna alındı.'),
            }
        );
    };

    const handleResetDeck = () => {
        if (!confirm(`[${currentVessel.name}] ${selectedDeckKey} güvertesindeki tüm istif sıfırlansın mı?`)) return;
        router.post(
            '/stowage/reset',
            {
                vesselId: currentVessel.id,
                deckKey: selectedDeckKey,
            },
            {
                onSuccess: () => toast.success('Güverte istifi sıfırlandı.'),
            }
        );
    };

    const deckPct = totalDeckCapacityLM > 0 ? Math.round((totalDeckUsedLM / totalDeckCapacityLM) * 100) : 0;

    return (
        <AppLayout breadcrumbs={[{ title: 'İstif Planı', href: '/stowage' }]}>
            <Head title={`2D İstif Planı (${currentVessel.name}) - Cenk Ro-Ro`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* 1. Gemi Seçimi & Bilgi Barı */}
                <Card className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{currentVessel.flag || '🚢'}</span>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Aktif Gemi & 2D İstif Planı
                                </div>
                                <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
                                    {currentVessel.name}
                                </h1>
                            </div>
                        </div>

                        {/* Vessel Switcher Pills */}
                        <div className="flex flex-wrap items-center gap-2">
                            {vessels.map((v) => (
                                <Button
                                    key={v.id}
                                    variant={currentVessel.id === v.id ? 'default' : 'outline'}
                                    size="sm"
                                    asChild
                                    className="text-xs font-semibold"
                                >
                                    <Link href={`/stowage?vessel=${v.id}`}>
                                        <span className="mr-1">{v.flag}</span>
                                        <span>{v.name}</span>
                                        <span className="ml-1 opacity-70 font-mono text-[10px]">({v.laneMeters} LM)</span>
                                    </Link>
                                </Button>
                            ))}
                        </div>

                        {activeVoyage && activeVoyage.vesselId === currentVessel.id && (
                            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-xs">
                                ✓ Aktif Seferde: {activeVoyage.id}
                            </Badge>
                        )}
                    </div>
                </Card>

                {/* 2. Güverte Sekmeleri ve Kısıtlar */}
                <Card className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            {allDeckKeys.map((dk) => (
                                <Button
                                    key={dk}
                                    variant={selectedDeckKey === dk ? 'default' : 'outline'}
                                    size="sm"
                                    asChild
                                >
                                    <Link href={`/stowage?vessel=${currentVessel.id}&deck=${dk}`}>
                                        <Layers className="mr-1.5 h-3.5 w-3.5" /> {dk}
                                    </Link>
                                </Button>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs">
                            <div className="flex items-center gap-3 text-muted-foreground font-medium">
                                <span>
                                    Yükseklik: <strong className="text-foreground">{currentDeck.clearHeight || 4.8}m</strong>
                                </span>
                                <span>
                                    Maks. Yük: <strong className="text-teal-500">{currentDeck.maxWeightTon || 1200}t</strong>
                                </span>
                                {currentDeck.hasFrigoPlugs && (
                                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 text-[10px]">
                                        <Zap className="mr-1 h-3 w-3" /> Frigo Prizleri Var
                                    </Badge>
                                )}
                                <span className="font-mono font-bold text-blue-500 dark:text-blue-400">
                                    Doluluk: {totalDeckUsedLM}m / {totalDeckCapacityLM}m (%{deckPct})
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetDeck}
                                className="text-destructive hover:bg-destructive/10 border-destructive/30 text-xs"
                            >
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Güverteyi Sıfırla
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* 3. Ana Çalışma Alanı: Sol 2D Güverte + Sağ Kuyruk */}
                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Left: 2D Graphical Vessel Deck Layout (8 Cols) */}
                    <Card className="lg:col-span-8 p-4 md:p-6 space-y-4">
                        <div className="flex flex-wrap items-center justify-between border-b pb-3">
                            <div>
                                <CardTitle className="text-base md:text-lg">
                                    🚢 {currentVessel.name} — {currentDeck.name || selectedDeckKey}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Gemi tanımına bağlı 2D şerit istif grafiği (Pruva ➔ Pupa)
                                </CardDescription>
                            </div>
                            <div className="flex gap-4 text-xs font-mono font-semibold">
                                <span className="text-emerald-500">
                                    🟢 Yüklü: {currentDeck.stowedUnits?.length || 0} Araç
                                </span>
                                <span className="text-blue-500">
                                    📏 Şerit: {deckLanesWithUnits.length} Şerit
                                </span>
                                <span className="text-teal-500">
                                    ⚖️ Ağırlık: {totalDeckUsedTon} Ton
                                </span>
                            </div>
                        </div>

                        {/* 2D Deck Graphic Container */}
                        <div className="relative rounded-2xl border-2 border-blue-500/30 bg-slate-950 p-4 md:p-6 shadow-inner text-white">
                            {/* Bow Indicator */}
                            <div className="mb-4 text-center text-xs font-extrabold tracking-widest text-sky-400 flex items-center justify-center gap-1">
                                <ChevronUp className="h-4 w-4 animate-bounce" /> PRUVA / BOW (GEMİ BAŞI) <ChevronUp className="h-4 w-4 animate-bounce" />
                            </div>

                            {/* Lanes Grid */}
                            <div className="space-y-3">
                                {deckLanesWithUnits.map((item) => {
                                    const laneNo = item.lane.laneNo || item.lane.lane || 1;
                                    const capLM = item.lane.capacityLM || item.lane.lengthM || 140;

                                    return (
                                        <div
                                            key={laneNo}
                                            className="rounded-lg border border-dashed border-sky-500/30 bg-slate-900/80 p-3"
                                        >
                                            {/* Lane Header */}
                                            <div className="mb-2 flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded bg-sky-500/20 px-2 py-0.5 font-mono font-extrabold text-sky-400">
                                                        ŞERİT {laneNo}
                                                    </span>
                                                    <span className="text-slate-400 text-[11px]">
                                                        {capLM} Metre (Maks: {item.lane.maxTrailers || 8} Araç)
                                                    </span>
                                                </div>
                                                <div className="font-mono text-xs font-bold text-slate-200">
                                                    {item.usedLM}m / {capLM}m (%{item.percent}) • {item.usedTon}t
                                                </div>
                                            </div>

                                            {/* Stowed Vehicles on this Lane */}
                                            <div className="flex min-h-[52px] items-center gap-2 overflow-x-auto rounded bg-black/40 p-2">
                                                {item.units.length === 0 ? (
                                                    <div className="text-xs text-slate-500 italic px-2">
                                                        Şerit boş — henüz araç yerleştirilmedi
                                                    </div>
                                                ) : (
                                                    item.units.map((u) => (
                                                        <div
                                                            key={u.bookingId}
                                                            className="flex flex-shrink-0 items-center justify-between gap-3 rounded-md border border-sky-500/60 bg-gradient-to-r from-sky-950 to-slate-900 px-2.5 py-1.5 shadow-sm"
                                                        >
                                                            <div>
                                                                <div className="font-mono text-xs font-black text-white">
                                                                    {u.plate}
                                                                </div>
                                                                <div className="font-mono text-[10px] text-sky-300">
                                                                    {u.lengthM}m • {u.weightTon}t
                                                                    {u.isReefer && ' • ⚡'}
                                                                    {u.isAdr && ' • ⚠️'}
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUnstow(u.bookingId)}
                                                                className="rounded bg-red-500/20 p-1 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                                                title="Şeritten İndir"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Stern Indicator */}
                            <div className="mt-4 text-center text-xs font-extrabold tracking-widest text-sky-400 flex items-center justify-center gap-1">
                                <ChevronDown className="h-4 w-4" /> PUPA / STERN (GEMİ KIÇI & RAMPASI) <ChevronDown className="h-4 w-4" />
                            </div>
                        </div>
                    </Card>

                    {/* Right: Unstowed Waiting Queue (4 Cols) */}
                    <Card className="lg:col-span-4 p-4 md:p-6 space-y-4 flex flex-col">
                        <div className="border-b pb-3">
                            <CardTitle className="text-base">Yükleme Kuyruğu</CardTitle>
                            <CardDescription className="text-xs">
                                Binişe hazır olup şerit istifi bekleyen araçlar ({unstowedQueue.length})
                            </CardDescription>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                            {unstowedQueue.length === 0 ? (
                                <div className="p-8 text-center text-xs text-muted-foreground">
                                    ✓ Bu gemi için stif bekleyen araç kalmadı. Tüm araçlar güvertelere yerleştirildi.
                                </div>
                            ) : (
                                unstowedQueue.map((q) => {
                                    const firstLane = currentDeck?.lanes[0]?.laneNo ?? 1;
                                    const selectedLane = selectedLanes[q.id] ?? firstLane;

                                    return (
                                        <div
                                            key={q.id}
                                            className="rounded-lg border bg-card p-3 space-y-2.5 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="font-mono text-sm font-bold text-foreground">
                                                        {q.truckPlate}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground truncate max-w-[170px]">
                                                        {q.shipper}
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[10px]">
                                                    {q.category}
                                                </Badge>
                                            </div>

                                            <div className="text-xs text-muted-foreground flex items-center gap-2 font-mono">
                                                <span>Boy: <strong>{q.lengthMeters}m</strong></span>
                                                <span>Ağırlık: <strong>{q.weightTon}t</strong></span>
                                                {q.isReefer && <Badge variant="outline" className="text-[9px] text-emerald-500">⚡ Frigo</Badge>}
                                                {q.isAdr && <Badge variant="outline" className="text-[9px] text-amber-500">⚠️ ADR</Badge>}
                                            </div>

                                            <div className="flex items-center gap-2 pt-1 border-t">
                                                <Select
                                                    value={String(selectedLane)}
                                                    onValueChange={(val) =>
                                                        setSelectedLanes((prev) => ({ ...prev, [q.id]: parseInt(val) }))
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 text-xs flex-1">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {currentDeck.lanes.map((l) => {
                                                            const lNo = l.laneNo || l.lane || 1;
                                                            const capLM = l.capacityLM || l.lengthM || 140;
                                                            return (
                                                                <SelectItem key={lNo} value={String(lNo)}>
                                                                    Şerit {lNo} ({capLM}m)
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>

                                                <Button
                                                    size="sm"
                                                    onClick={() => handleStow(q.id)}
                                                    className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3"
                                                >
                                                    Yükle
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
