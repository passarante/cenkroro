import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Booking, Category, Forwarder, Voyage } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    Check,
    CheckCircle2,
    ChevronDown,
    CreditCard,
    Edit2,
    FileSpreadsheet,
    Globe,
    Layers,
    Lock,
    Monitor,
    Plus,
    Printer,
    Search,
    Ship,
    Trash2,
    X,
    XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    DataTableColumnHeader,
    DataTablePagination,
    DataTableSearch,
    DataTableViewToggle,
} from '@/components/data-table';
import { useDataTable } from '@/hooks/use-data-table';

interface BookingsIndexProps {
    bookings: Booking[];
    voyages: Voyage[];
    forwarders: Forwarder[];
    categories: Category[];
    selectedVoyageId: string;
    searchTerm: string;
    paymentFilter: string;
    boardingFilter: string;
    categoryFilter: string;
    channelFilter: string;
    unassignedCount: number;
    totalCount: number;
    webCount: number;
    platformCount: number;
    paidCount: number;
    waitingPaymentCount?: number;
    pendingApprovalCount: number;
    includedCount: number;
    readyToBoardCount: number;
    failedBoardingCount: number;
}

// Arama yapılabilir ve Sefer Başlangıç / Kalkış Tarihini gösteren Sefer Filtresi
function VoyageSearchFilter({
    voyages,
    selectedVoyageId,
    unassignedCount,
    onSelect,
}: {
    voyages: Voyage[];
    selectedVoyageId: string;
    unassignedCount: number;
    onSelect: (val: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 60);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const selectedVoyage = voyages.find((v) => v.id === selectedVoyageId);

    const filteredVoyages = voyages.filter((v) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase().trim();
        return (
            (v.id && v.id.toLowerCase().includes(q)) ||
            (v.vesselName && v.vesselName.toLowerCase().includes(q)) ||
            (v.route && v.route.toLowerCase().includes(q)) ||
            (v.departurePort && v.departurePort.toLowerCase().includes(q)) ||
            (v.arrivalPort && v.arrivalPort.toLowerCase().includes(q)) ||
            (v.departureTime && v.departureTime.toLowerCase().includes(q))
        );
    });

    const handleItemClick = (val: string) => {
        onSelect(val);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative flex-1 min-w-[280px] max-w-xl" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs font-medium shadow-xs ring-offset-background transition-colors hover:bg-muted/50 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer',
                    isOpen && 'ring-2 ring-ring ring-offset-2 border-primary'
                )}
            >
                <div className="flex items-center gap-2 truncate text-left mr-2">
                    {selectedVoyageId === 'ALL' ? (
                        <span className="flex items-center gap-1.5 text-foreground font-semibold">
                            <Globe className="h-4 w-4 text-primary shrink-0" /> Tüm Seferler (Genel Bakış)
                        </span>
                    ) : selectedVoyageId === 'UNASSIGNED' ? (
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                            <AlertCircle className="h-4 w-4 shrink-0" /> Sefer Atanmamış Biletler ({unassignedCount})
                        </span>
                    ) : selectedVoyage ? (
                        <div className="flex items-center gap-2 truncate">
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                🚢 {selectedVoyage.id}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-semibold text-foreground truncate">
                                {selectedVoyage.vesselName} ({selectedVoyage.route})
                            </span>
                            {selectedVoyage.departureTime && (
                                <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 font-mono text-[11px] text-blue-600 dark:text-blue-400 border border-blue-500/20 whitespace-nowrap shrink-0">
                                    <Calendar className="h-3 w-3" /> {selectedVoyage.departureTime}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">Sefer Seçiniz...</span>
                    )}
                </div>
                <ChevronDown className={cn('h-4 w-4 shrink-0 opacity-50 transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[340px] max-w-2xl rounded-md border bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95">
                    {/* Arama Çubuğu */}
                    <div className="p-2.5 border-b bg-muted/40">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                ref={searchInputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Sefer no, gemi adı, rota veya başlangıç tarihi ara..."
                                className="h-8 pl-8 pr-8 text-xs bg-background"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                    title="Aramayı Temizle"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sefer Seçenekleri Listesi */}
                    <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
                        {(!query || 'tüm seferler genel bakış'.includes(query.toLowerCase())) && (
                            <button
                                type="button"
                                onClick={() => handleItemClick('ALL')}
                                className={cn(
                                    'flex w-full items-center justify-between rounded-sm px-3 py-2 text-xs transition-colors hover:bg-muted text-left cursor-pointer',
                                    selectedVoyageId === 'ALL' && 'bg-primary/10 font-semibold text-primary'
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-primary" />
                                    <span>🌐 Tüm Seferler (Genel Bakış)</span>
                                </div>
                                {selectedVoyageId === 'ALL' && <Check className="h-4 w-4 text-primary" />}
                            </button>
                        )}

                        {unassignedCount > 0 && (!query || 'sefer atanmamış biletler'.includes(query.toLowerCase())) && (
                            <button
                                type="button"
                                onClick={() => handleItemClick('UNASSIGNED')}
                                className={cn(
                                    'flex w-full items-center justify-between rounded-sm px-3 py-2 text-xs transition-colors hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-left cursor-pointer',
                                    selectedVoyageId === 'UNASSIGNED' && 'bg-amber-500/15 font-semibold'
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>⚠️ Sefer Atanmamış Biletler ({unassignedCount})</span>
                                </div>
                                {selectedVoyageId === 'UNASSIGNED' && <Check className="h-4 w-4" />}
                            </button>
                        )}

                        {(!query || 'tüm seferler genel bakış'.includes(query.toLowerCase()) || unassignedCount > 0) && (
                            <div className="h-px bg-border my-1" />
                        )}

                        {filteredVoyages.length === 0 ? (
                            <div className="py-6 text-center text-xs text-muted-foreground">
                                "{query}" ile eşleşen sefer bulunamadı.
                            </div>
                        ) : (
                            filteredVoyages.map((v) => {
                                const isSelected = selectedVoyageId === v.id;
                                return (
                                    <button
                                        key={v.id}
                                        type="button"
                                        onClick={() => handleItemClick(v.id)}
                                        className={cn(
                                            'flex w-full items-center justify-between rounded-sm px-3 py-2.5 text-xs transition-colors hover:bg-muted text-left cursor-pointer',
                                            isSelected && 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border-l-2 border-blue-500'
                                        )}
                                    >
                                        <div className="space-y-1.5 pr-2 truncate">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-foreground">
                                                    🚢 {v.id}
                                                </span>
                                                <span className="text-muted-foreground">•</span>
                                                <span className="font-semibold text-foreground truncate">
                                                    {v.vesselName}
                                                </span>
                                                <span className="text-muted-foreground text-[11px] truncate">
                                                    ({v.route})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px]">
                                                <span className="inline-flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                                                    <Calendar className="h-3 w-3" />
                                                    <strong>Kalkış / Başlangıç:</strong> {v.departureTime || 'Tarih Belirtilmedi'}
                                                </span>
                                                {v.status && (
                                                    <Badge variant="outline" className="text-[10px] py-0 border-muted text-muted-foreground font-normal">
                                                        {v.status}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {isSelected && <Check className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 ml-2" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function BookingsIndex({
    bookings = [],
    voyages = [],
    forwarders = [],
    categories = [],
    selectedVoyageId = 'ALL',
    searchTerm = '',
    paymentFilter = 'ALL',
    boardingFilter = 'ALL',
    categoryFilter = 'ALL',
    channelFilter = 'ALL',
    unassignedCount = 0,
    totalCount = 0,
    webCount = 0,
    platformCount = 0,
    paidCount = 0,
    waitingPaymentCount = 0,
    pendingApprovalCount = 0,
    includedCount = 0,
    readyToBoardCount = 0,
    failedBoardingCount = 0,
}: BookingsIndexProps) {
    // Dialog states
    const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
    const [isBulkBookingOpen, setIsBulkBookingOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [riskBooking, setRiskBooking] = useState<Booking | null>(null);
    const [failedBoardingBooking, setFailedBoardingBooking] = useState<Booking | null>(null);

    // Data table hook for pagination, sorting, search, and table/card view
    const {
        viewMode,
        setViewMode,
        searchTerm: tableSearch,
        setSearchTerm: setTableSearch,
        sortKey,
        sortDir,
        handleSort,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        paginatedData,
        totalItems,
        totalPages,
        startIndex,
        endIndex,
    } = useDataTable<Booking>({
        data: bookings,
        initialSortKey: 'id',
        initialSortDir: 'desc',
        initialPageSize: 10,
        initialViewMode: 'table',
        searchFields: [
            'id',
            'shipper',
            'truckPlate',
            'trailerPlate',
            'driverName',
            'driverPhone',
            'category',
            'voyageId',
            'paymentStatus',
            'boardingStatus',
            'cargoDescription',
        ],
    });

    // Filter Form
    const handleFilterChange = (key: string, value: string) => {
        const url = new URL(window.location.href);
        if (value && value !== 'ALL') {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
        router.visit(url.toString(), { preserveState: true, replace: true });
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const searchInput = form.elements.namedItem('search') as HTMLInputElement;
        handleFilterChange('search', searchInput.value);
    };

    // 1. Single Booking Form
    const newBookingForm = useForm({
        voyageId: selectedVoyageId !== 'ALL' && selectedVoyageId !== 'UNASSIGNED' ? selectedVoyageId : (voyages[0]?.id || ''),
        shipper: forwarders[0]?.name || '',
        truckPlate: '',
        trailerPlate: '',
        driverName: '',
        driverPhone: '+90 5',
        category: 'Komple TIR',
        lengthMeters: 16.5,
        weightTon: 36.0,
        cargoDescription: 'Genel Ticari Yük',
        paymentMethod: 'Cari Hesap',
        paymentStatus: 'PAID',
        paymentAmountEur: 1450,
        isReefer: false,
        isAdr: false,
    });

    const handleCreateBooking = (e: React.FormEvent) => {
        e.preventDefault();
        newBookingForm.post('/bookings/store', {
            onSuccess: () => {
                toast.success('Rezervasyon başarıyla oluşturuldu.');
                setIsNewBookingOpen(false);
                newBookingForm.reset();
            },
            onError: () => toast.error('Lütfen zorunlu alanları kontrol ediniz.'),
        });
    };

    // 2. Edit Booking Form
    const editBookingForm = useForm({
        voyageId: '',
        shipper: '',
        truckPlate: '',
        trailerPlate: '',
        driverName: '',
        driverPhone: '',
        category: '',
        lengthMeters: 16.5,
        weightTon: 36.0,
        cargoDescription: '',
        paymentMethod: 'Cari Hesap',
        paymentStatus: 'PAID',
        boardingStatus: 'WAITING_APPROVAL',
        status: 'Rezervasyon Açıldı',
        paymentAmountEur: 1450,
    });

    const openEditBooking = (b: Booking) => {
        setEditingBooking(b);
        editBookingForm.setData({
            voyageId: b.voyageId || '',
            shipper: b.shipper,
            truckPlate: b.truckPlate,
            trailerPlate: b.trailerPlate || '',
            driverName: b.driverName || '',
            driverPhone: b.driverPhone || '',
            category: b.category,
            lengthMeters: b.lengthMeters,
            weightTon: b.weightTon,
            cargoDescription: b.cargoDescription || '',
            paymentMethod: b.paymentMethod || 'Cari Hesap',
            paymentStatus: b.paymentStatus,
            boardingStatus: b.boardingStatus,
            status: b.status,
            paymentAmountEur: b.paymentAmountEur || 1450,
        });
    };

    const handleUpdateBooking = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBooking) return;
        editBookingForm.post(`/bookings/update/${editingBooking.id}`, {
            onSuccess: () => {
                toast.success('Bilet bilgileri güncellendi.');
                setEditingBooking(null);
            },
        });
    };

    // Banka Ödemesini Onayla
    const handleApprovePayment = (id: string, plate: string) => {
        router.post(`/bookings/approve-payment/${id}`, {}, {
            onSuccess: () => toast.success(`💳 ${plate} biletinin banka ödemesi onaylandı ve durumu 'Ödendi' olarak güncellendi.`),
            onError: () => toast.error('Ödeme onaylama işlemi sırasında bir hata oluştu.'),
        });
    };

    // 3. Risk Approval Form
    const riskForm = useForm({
        approver: 'Finans Müdürü',
        reason: 'Teminat Mektubu / Ek Protokol Alındı',
    });

    const handleRiskApproval = (e: React.FormEvent) => {
        e.preventDefault();
        if (!riskBooking) return;
        riskForm.post(`/bookings/risk-approval/${riskBooking.id}`, {
            onSuccess: () => {
                toast.success('Risk onayı verildi ve araç sefere dahil edildi.');
                setRiskBooking(null);
            },
        });
    };

    // 4. Failed Boarding Form
    const failedBoardingForm = useForm({
        fault: 'FORW_FAULT',
        reason: 'Evrak Eksikliği / Gümrük Problemi',
        notes: '',
    });

    const handleFailedBoarding = (e: React.FormEvent) => {
        e.preventDefault();
        if (!failedBoardingBooking) return;
        failedBoardingForm.post(`/bookings/failed-boarding/${failedBoardingBooking.id}`, {
            onSuccess: () => {
                toast.error('Biniş iptal tutanağı işlendi ve araç seferden çıkarıldı.');
                setFailedBoardingBooking(null);
            },
        });
    };

    // 5. Bulk Booking Form
    const bulkBookingForm = useForm({
        voyageId: voyages[0]?.id || '',
        shipper: forwarders[0]?.name || '',
        paymentMethod: 'Cari Hesap',
        cargoDescription: 'Toplu Platform Rezervasyonu',
        vehicles: [
            { truckPlate: '', trailerPlate: '', driverName: '', driverPhone: '', category: 'Komple TIR', lengthMeters: 16.5, weightTon: 36.0, isReefer: false, isAdr: false },
            { truckPlate: '', trailerPlate: '', driverName: '', driverPhone: '', category: 'Komple TIR', lengthMeters: 16.5, weightTon: 36.0, isReefer: false, isAdr: false },
            { truckPlate: '', trailerPlate: '', driverName: '', driverPhone: '', category: 'Komple TIR', lengthMeters: 16.5, weightTon: 36.0, isReefer: false, isAdr: false },
        ],
    });

    const handleBulkVehicleChange = (index: number, field: string, value: any) => {
        const nextVehicles = [...bulkBookingForm.data.vehicles];
        nextVehicles[index] = { ...nextVehicles[index], [field]: value };
        bulkBookingForm.setData('vehicles', nextVehicles);
    };

    const addBulkRow = () => {
        bulkBookingForm.setData('vehicles', [
            ...bulkBookingForm.data.vehicles,
            { truckPlate: '', trailerPlate: '', driverName: '', driverPhone: '', category: 'Komple TIR', lengthMeters: 16.5, weightTon: 36.0, isReefer: false, isAdr: false },
        ]);
    };

    const handleBulkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        bulkBookingForm.post('/bookings/bulk-store', {
            onSuccess: () => {
                toast.success('Toplu rezervasyonlar başarıyla açıldı.');
                setIsBulkBookingOpen(false);
            },
        });
    };

    // Quick Actions
    const handleInclude = (id: string) => {
        router.post(`/bookings/include/${id}`, {}, {
            onSuccess: () => toast.success('Araç sefere dahil edildi ve gemiye yüklendi.'),
        });
    };

    const handleAssignVoyage = (bookingId: string, targetVoyageId: string) => {
        router.post(`/bookings/assign/${bookingId}`, { targetVoyageId }, {
            onSuccess: () => toast.success('Sefer ataması güncellendi.'),
        });
    };

    const handleDeleteBooking = (id: string) => {
        if (!confirm(`[${id}] biletini sistemden silmek istediğinize emin misiniz?`)) return;
        router.post(`/bookings/destroy/${id}`, {}, {
            onSuccess: () => toast.success('Bilet silindi.'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Rezervasyon Masası', href: '/bookings' }]}>
            <Head title="Rezervasyon & Biniş Yönetimi - Cenk Ro-Ro" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Top KPI Summary */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <Card className="p-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">TOPLAM BİLET</div>
                        <div className="font-mono text-2xl font-bold text-foreground">{totalCount}</div>
                        <div className="text-xs text-blue-500 font-medium">Kayıtlı Rezervasyon</div>
                    </Card>

                    <Card className="p-4 border-emerald-500/30 bg-emerald-500/5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                            <Globe className="h-3 w-3" /> WEB REZERVASYONU
                        </div>
                        <div className="font-mono text-2xl font-bold text-emerald-500">{webCount}</div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Online Portaldan Giriş</div>
                    </Card>

                    <Card className="p-4 border-blue-500/30 bg-blue-500/5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1">
                            <Monitor className="h-3 w-3" /> PLATFORM
                        </div>
                        <div className="font-mono text-2xl font-bold text-blue-500">{platformCount}</div>
                        <div className="text-xs text-muted-foreground font-medium">Operasyon Masası</div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ÖDEMESİ TAM</div>
                        <div className="font-mono text-2xl font-bold text-emerald-500">{paidCount}</div>
                        <div className="text-xs text-emerald-500/80 font-medium">Cari / Kart Tahsilatı</div>
                    </Card>

                    <Card className="p-4 border-amber-500/20 bg-amber-500/5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                            ÖDEME & ONAY BEKLEYEN
                        </div>
                        <div className="font-mono text-2xl font-bold text-amber-500">
                            {waitingPaymentCount + pendingApprovalCount}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            Banka: {waitingPaymentCount} • Risk: {pendingApprovalCount}
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">GEMİDE (DAHİL)</div>
                        <div className="font-mono text-2xl font-bold text-cyan-500">{includedCount}</div>
                        <div className="text-xs text-cyan-500/80 font-medium">Yükleme Onaylı</div>
                    </Card>
                </div>

                {/* Channel Filter Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant={channelFilter === 'ALL' ? 'default' : 'outline'}
                        onClick={() => handleFilterChange('channel', 'ALL')}
                        className="font-medium"
                        size="sm"
                    >
                        <Layers className="mr-1.5 h-4 w-4" /> Tüm Rezervasyonlar ({totalCount})
                    </Button>
                    <Button
                        variant={channelFilter === 'Web' ? 'default' : 'outline'}
                        onClick={() => handleFilterChange('channel', 'Web')}
                        className={
                            channelFilter === 'Web'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium'
                                : 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-medium'
                        }
                        size="sm"
                    >
                        <Globe className="mr-1.5 h-4 w-4" /> Web Rezervasyonları ({webCount})
                    </Button>
                    <Button
                        variant={channelFilter === 'Platform' ? 'default' : 'outline'}
                        onClick={() => handleFilterChange('channel', 'Platform')}
                        className={
                            channelFilter === 'Platform'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white font-medium'
                                : 'border-blue-500/40 text-blue-600 dark:text-blue-400 font-medium'
                        }
                        size="sm"
                    >
                        <Monitor className="mr-1.5 h-4 w-4" /> Platform Rezervasyonları ({platformCount})
                    </Button>
                </div>

                {/* Filter and Action Bar Card */}
                <Card className="p-4">
                    <div className="space-y-4">
                        {/* Sefer Seçici & Butonlar */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2 flex-1 min-w-[280px] max-w-xl">
                                <Label className="text-xs font-bold whitespace-nowrap">Sefer Filtresi:</Label>
                                <VoyageSearchFilter
                                    voyages={voyages}
                                    selectedVoyageId={selectedVoyageId}
                                    unassignedCount={unassignedCount}
                                    onSelect={(val) => handleFilterChange('voyage', val)}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsBulkBookingOpen(true)}
                                    className="border-blue-500/40 text-blue-600 dark:text-blue-400 font-medium"
                                    size="sm"
                                >
                                    <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Toplu Rezervasyon Aç
                                </Button>
                                <Button
                                    onClick={() => setIsNewBookingOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                    size="sm"
                                >
                                    <Plus className="mr-1.5 h-4 w-4" /> Yeni Rezervasyon Aç
                                </Button>
                            </div>
                        </div>

                        {/* Search & Select Filters */}
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    name="search"
                                    defaultValue={searchTerm}
                                    placeholder="Plaka, Firma, Sürücü veya Bilet ID ara..."
                                    className="pl-8 text-sm"
                                />
                            </form>

                            <Select
                                value={paymentFilter}
                                onValueChange={(val) => handleFilterChange('payment', val)}
                            >
                                <SelectTrigger className="text-xs">
                                    <SelectValue placeholder="Ödeme Durumu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tüm Ödemeler</SelectItem>
                                    <SelectItem value="PAID">✓ Ödendi (Cari / Onaylı)</SelectItem>
                                    <SelectItem value="WAITING_PAYMENT">⏳ Ödeme Bekleniyor (Banka)</SelectItem>
                                    <SelectItem value="PENDING_APPROVAL">⚠️ Onay Bekliyor (Limit/Risk)</SelectItem>
                                    <SelectItem value="DISPUTED_BLOCKED">🛑 Riskli / Askıda</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={boardingFilter}
                                onValueChange={(val) => handleFilterChange('boarding', val)}
                            >
                                <SelectTrigger className="text-xs">
                                    <SelectValue placeholder="Biniş Durumu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tüm Biniş Durumları</SelectItem>
                                    <SelectItem value="INCLUDED">🚢 Sefere Dahil (Gemide)</SelectItem>
                                    <SelectItem value="READY_TO_BOARD">🟢 Binişe Hazır</SelectItem>
                                    <SelectItem value="WAITING_APPROVAL">⏳ Beklemede</SelectItem>
                                    <SelectItem value="FAILED_BOARDING">✕ İptal Edildi</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={categoryFilter}
                                onValueChange={(val) => handleFilterChange('category', val)}
                            >
                                <SelectTrigger className="text-xs">
                                    <SelectValue placeholder="Araç Tipi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tüm Araç Tipleri</SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.name}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* Bookings Table & Card View Section */}
                <Card className="border-border/60 shadow-xs">
                    <CardHeader className="pb-3 border-b border-border/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-lg">
                                    Rezervasyon ve Bilet Kayıtları ({totalItems})
                                </CardTitle>
                                <CardDescription>
                                    Veritabanından çekilen gerçek zamanlı lojistik ve araç manifestoları
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <DataTableSearch
                                    value={tableSearch}
                                    onChange={setTableSearch}
                                    placeholder="Bilet, plaka, firma ara..."
                                    className="w-48 sm:w-60"
                                />
                                <DataTableViewToggle
                                    viewMode={viewMode}
                                    onViewModeChange={setViewMode}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        {viewMode === 'table' ? (
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <DataTableColumnHeader
                                                title="Bilet No"
                                                sortKey="id"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={handleSort}
                                                align="center"
                                            />
                                            <DataTableColumnHeader
                                                title="Kanal"
                                                sortKey="bookingChannel"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={handleSort}
                                                align="center"
                                            />
                                            <DataTableColumnHeader
                                                title="Çekici / Dorse"
                                                sortKey="truckPlate"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={handleSort}
                                                align="center"
                                            />
                                            <DataTableColumnHeader
                                                title="Lojistik Firması"
                                                sortKey="shipper"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={handleSort}
                                                align="center"
                                            />
                                            <DataTableColumnHeader
                                                title="Sürücü"
                                                sortKey="driverName"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={handleSort}
                                                align="center"
                                            />
                                            <DataTableColumnHeader
                                                title="Ebat & Kategori"
                                                sortKey="lengthMeters"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={handleSort}
                                                align="center"
                                            />
                                            <DataTableColumnHeader
                                                title="Sefer Ataması"
                                                sortKey="voyageId"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={handleSort}
                                                align="center"
                                            />
                                            <DataTableColumnHeader
                                                title="Ödeme"
                                                sortKey="paymentStatus"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={handleSort}
                                                align="center"
                                            />
                                            <DataTableColumnHeader
                                                title="Biniş / Saha"
                                                sortKey="boardingStatus"
                                                currentSortKey={sortKey}
                                                currentSortDir={sortDir}
                                                onSort={handleSort}
                                                align="center"
                                            />
                                            <TableHead className="text-center whitespace-nowrap">Aksiyonlar</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                                                    Filtrelere veya aramaya uygun rezervasyon kaydı bulunamadı.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedData.map((b) => (
                                                <TableRow key={b.id} className="hover:bg-muted/50">
                                                    <TableCell className="text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                                                        {b.id}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex justify-center">
                                                            {b.bookingChannel === 'Web' ? (
                                                                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]">
                                                                    🌐 Web
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 text-[10px]">
                                                                    🖥️ Platform
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="font-mono font-bold">{b.truckPlate}</div>
                                                        {b.trailerPlate && (
                                                            <div className="font-mono text-xs text-muted-foreground">{b.trailerPlate}</div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium">{b.shipper}</TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="text-xs font-semibold">{b.driverName || '-'}</div>
                                                        <div className="font-mono text-[11px] text-muted-foreground">{b.driverPhone || ''}</div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <Badge variant="outline" className="text-[11px] mb-0.5">
                                                                {b.category}
                                                            </Badge>
                                                            <div className="font-mono text-[11px] text-muted-foreground">
                                                                {b.lengthMeters}m • {b.weightTon}t
                                                                {b.isReefer && ' • ⚡Frigo'}
                                                                {b.isAdr && ' • ☣️ADR'}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <Select
                                                                value={b.voyageId || ''}
                                                                onValueChange={(val) => handleAssignVoyage(b.id, val)}
                                                            >
                                                                <SelectTrigger className="h-7 text-xs font-mono min-w-[130px] mx-auto">
                                                                    <SelectValue placeholder="Sefer Seç" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {voyages.map((v) => (
                                                                        <SelectItem key={v.id} value={v.id}>
                                                                            {v.id} {v.departureTime ? `(${v.departureTime})` : ''}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            {b.paymentStatus === 'PAID' ? (
                                                                <div>
                                                                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                                                                        ✓ Ödendi
                                                                    </Badge>
                                                                    <div className="text-[10px] text-muted-foreground mt-0.5">{b.paymentMethod || 'Cari Hesap'}</div>
                                                                </div>
                                                            ) : b.paymentStatus === 'WAITING_PAYMENT' ? (
                                                                <div>
                                                                    <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-medium">
                                                                        ⏳ Ödeme Bekleniyor
                                                                    </Badge>
                                                                    <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-medium mt-0.5">{b.paymentMethod || 'Banka'}</div>
                                                                </div>
                                                            ) : b.paymentStatus === 'PENDING_APPROVAL' ? (
                                                                <div>
                                                                    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-[11px]">
                                                                        ⏳ Onay Bekliyor
                                                                    </Badge>
                                                                    <div className="text-[10px] text-muted-foreground mt-0.5">Limit / Risk</div>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <Badge variant="destructive" className="text-[11px]">🛑 Askıda</Badge>
                                                                    <div className="text-[10px] text-muted-foreground mt-0.5">{b.paymentMethod || 'Bloke'}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex justify-center">
                                                            {b.boardingStatus === 'INCLUDED' ? (
                                                                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[11px]">
                                                                    🚢 Gemide
                                                                </Badge>
                                                            ) : b.boardingStatus === 'READY_TO_BOARD' ? (
                                                                <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-500 text-[11px]">
                                                                    🟢 Binişe Hazır
                                                                </Badge>
                                                            ) : b.boardingStatus === 'FAILED_BOARDING' ? (
                                                                <Badge variant="destructive" className="text-[11px]">✕ İptal Edildi</Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-[11px]">
                                                                    ⏳ Beklemede
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            {b.paymentStatus === 'WAITING_PAYMENT' && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-7 text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-medium"
                                                                    onClick={() => handleApprovePayment(b.id, b.truckPlate)}
                                                                    title="Banka Ödemesini Onayla ve Ödendi Yap"
                                                                >
                                                                    <CreditCard className="h-3.5 w-3.5 mr-1 text-amber-500" /> Ödemeyi Onayla
                                                                </Button>
                                                            )}

                                                            {b.boardingStatus !== 'INCLUDED' && b.boardingStatus !== 'FAILED_BOARDING' && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={b.paymentStatus !== 'PAID'}
                                                                    className={cn(
                                                                        "h-7 text-xs font-medium",
                                                                        b.paymentStatus === 'PAID'
                                                                            ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                                                                            : "opacity-40 cursor-not-allowed bg-muted/30 text-muted-foreground border-border hover:bg-transparent"
                                                                    )}
                                                                    onClick={() => b.paymentStatus === 'PAID' && handleInclude(b.id)}
                                                                    title={b.paymentStatus === 'PAID' ? "Sefere Dahil Et" : "Ödeme tamamlanana kadar dahil edilemez"}
                                                                >
                                                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Dahil Et
                                                                </Button>
                                                            )}

                                                            {b.paymentStatus === 'PENDING_APPROVAL' && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-7 text-xs border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
                                                                    onClick={() => setRiskBooking(b)}
                                                                    title="Risk Onayı Ver"
                                                                >
                                                                    <AlertCircle className="h-3.5 w-3.5 mr-1" /> Risk Onayı
                                                                </Button>
                                                            )}

                                                            {b.boardingStatus !== 'FAILED_BOARDING' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-500"
                                                                    onClick={() => setFailedBoardingBooking(b)}
                                                                    title="Biniş İptal Tutanağı"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            )}

                                                            {b.bookingChannel === 'Web' && b.paymentStatus !== 'PAID' ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    disabled
                                                                    className="h-7 w-7 p-0 opacity-40 cursor-not-allowed text-muted-foreground"
                                                                    title="Web Rezervasyonu: Ödeme onayı tamamlanana kadar biniş kartı yazdırılamaz"
                                                                >
                                                                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 w-7 p-0"
                                                                    asChild
                                                                    title="Biniş Kartı"
                                                                >
                                                                    <Link href={`/bookings/boarding-pass/${b.id}`} target="_blank">
                                                                        <Printer className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                                    </Link>
                                                                </Button>
                                                            )}

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                                onClick={() => openEditBooking(b)}
                                                                title="Bilet Düzenle"
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </Button>

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleDeleteBooking(b.id)}
                                                                title="Bileti Sil"
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
                            /* Card View */
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {paginatedData.length === 0 ? (
                                    <div className="col-span-full py-12 text-center text-muted-foreground">
                                        Filtrelere veya aramaya uygun rezervasyon kaydı bulunamadı.
                                    </div>
                                ) : (
                                    paginatedData.map((b) => (
                                        <Card key={b.id} className="flex flex-col justify-between overflow-hidden shadow-2xs hover:border-blue-500/40 transition-colors">
                                            <div className="p-4 space-y-3">
                                                {/* Header row */}
                                                <div className="flex items-center justify-between border-b pb-2.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                                                            {b.id}
                                                        </span>
                                                        {b.bookingChannel === 'Web' ? (
                                                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]">
                                                                🌐 Web
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 text-[10px]">
                                                                🖥️ Platform
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {b.paymentStatus === 'PAID' ? (
                                                            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                                                                ✓ Ödendi
                                                            </Badge>
                                                        ) : b.paymentStatus === 'WAITING_PAYMENT' ? (
                                                            <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px]">
                                                                ⏳ Ödeme Bekleniyor
                                                            </Badge>
                                                        ) : b.paymentStatus === 'PENDING_APPROVAL' ? (
                                                            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-[10px]">
                                                                ⏳ Onay Bekliyor
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="destructive" className="text-[10px]">🛑 Askıda</Badge>
                                                        )}
                                                        {b.boardingStatus === 'INCLUDED' ? (
                                                            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[10px]">
                                                                🚢 Gemide
                                                            </Badge>
                                                        ) : b.boardingStatus === 'READY_TO_BOARD' ? (
                                                            <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-500 text-[10px]">
                                                                🟢 Binişe Hazır
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-[10px]">
                                                                ⏳ Beklemede
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Plate & Forwarder */}
                                                <div>
                                                    <div className="flex items-baseline justify-between">
                                                        <span className="font-mono text-base font-bold text-foreground">
                                                            {b.truckPlate}
                                                        </span>
                                                        {b.trailerPlate && (
                                                            <span className="font-mono text-xs text-muted-foreground">
                                                                Dorse: {b.trailerPlate}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs font-semibold text-muted-foreground mt-0.5">
                                                        {b.shipper}
                                                    </div>
                                                </div>

                                                {/* Specs & Driver */}
                                                <div className="rounded-md bg-muted/40 p-2.5 space-y-1.5 text-xs">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">Kategori:</span>
                                                        <Badge variant="secondary" className="text-[10px]">
                                                            {b.category}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between font-mono text-[11px]">
                                                        <span className="text-muted-foreground">Ebat & Ağırlık:</span>
                                                        <span>{b.lengthMeters}m • {b.weightTon} ton</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[11px]">
                                                        <span className="text-muted-foreground">Sürücü:</span>
                                                        <span className="font-medium">{b.driverName || '-'} ({b.driverPhone || ''})</span>
                                                    </div>
                                                </div>

                                                {/* Voyage assignment */}
                                                <div className="flex items-center justify-between gap-2 pt-1">
                                                    <span className="text-xs text-muted-foreground">Sefer:</span>
                                                    <Select
                                                        value={b.voyageId || ''}
                                                        onValueChange={(val) => handleAssignVoyage(b.id, val)}
                                                    >
                                                        <SelectTrigger className="h-7 text-xs font-mono min-w-[160px]">
                                                            <SelectValue placeholder="Sefer Seçiniz" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {voyages.map((v) => (
                                                                <SelectItem key={v.id} value={v.id}>
                                                                    {v.id} {v.departureTime ? `(${v.departureTime})` : ''}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Card footer actions */}
                                            <div className="flex items-center justify-between border-t bg-muted/20 px-3 py-2">
                                                <div className="flex items-center gap-1">
                                                    {b.paymentStatus === 'WAITING_PAYMENT' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 px-2 font-medium"
                                                            onClick={() => handleApprovePayment(b.id, b.truckPlate)}
                                                            title="Banka Ödemesini Onayla"
                                                        >
                                                            <CreditCard className="h-3 w-3 mr-1 text-amber-500" /> Ödeme Onayla
                                                        </Button>
                                                    )}
                                                    {b.boardingStatus !== 'INCLUDED' && b.boardingStatus !== 'FAILED_BOARDING' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={b.paymentStatus !== 'PAID'}
                                                            className={cn(
                                                                "h-7 text-xs px-2 font-medium",
                                                                b.paymentStatus === 'PAID'
                                                                    ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                                                                    : "opacity-40 cursor-not-allowed bg-muted/30 text-muted-foreground border-border hover:bg-transparent"
                                                            )}
                                                            onClick={() => b.paymentStatus === 'PAID' && handleInclude(b.id)}
                                                            title={b.paymentStatus === 'PAID' ? "Sefere Dahil Et" : "Ödeme tamamlanana kadar dahil edilemez"}
                                                        >
                                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Dahil Et
                                                        </Button>
                                                    )}
                                                    {b.paymentStatus === 'PENDING_APPROVAL' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-xs border-amber-500/40 text-amber-500 hover:bg-amber-500/10 px-2"
                                                            onClick={() => setRiskBooking(b)}
                                                        >
                                                            <AlertCircle className="h-3 w-3 mr-1" /> Risk
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {b.bookingChannel === 'Web' && b.paymentStatus !== 'PAID' ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled
                                                            className="h-7 w-7 p-0 opacity-40 cursor-not-allowed text-muted-foreground"
                                                            title="Web Rezervasyonu: Ödeme onayı tamamlanana kadar biniş kartı yazdırılamaz"
                                                        >
                                                            <Lock className="h-3.5 w-3.5 text-amber-500" />
                                                        </Button>
                                                    ) : (
                                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild title="Biniş Kartı">
                                                            <Link href={`/bookings/boarding-pass/${b.id}`} target="_blank">
                                                                <Printer className="h-3.5 w-3.5" />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEditBooking(b)} title="Düzenle">
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteBooking(b.id)} title="Sil">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Pagination footer */}
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
                    </CardContent>
                </Card>
            </div>

            {/* MODALS */}
            {/* 1. New Booking Dialog */}
            <Dialog open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen}>
                <DialogContent className="max-w-3xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Yeni Rezervasyon Aç</DialogTitle>
                        <DialogDescription>
                            Aracı sefere kaydedip liman kabul ve biniş listesine dahil edin.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateBooking} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Sefer Seçimi</Label>
                                <Select
                                    value={newBookingForm.data.voyageId}
                                    onValueChange={(val) => newBookingForm.setData('voyageId', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sefer seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {voyages.map((v) => (
                                            <SelectItem key={v.id} value={v.id}>
                                                🚢 {v.id} • {v.vesselName} ({v.route}) {v.departureTime ? `— 📅 ${v.departureTime}` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Lojistik Firması (Cari)</Label>
                                <Select
                                    value={newBookingForm.data.shipper}
                                    onValueChange={(val) => newBookingForm.setData('shipper', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Firma seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {forwarders.map((f) => (
                                            <SelectItem key={f.id} value={f.name}>
                                                {f.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Ödeme Tipi & Tutar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg border bg-muted/30">
                            <div className="space-y-1.5">
                                <Label className="font-semibold text-foreground flex items-center gap-1.5">
                                    <CreditCard className="h-4 w-4 text-blue-500" /> Ödeme Tipi *
                                </Label>
                                <Select
                                    value={newBookingForm.data.paymentMethod}
                                    onValueChange={(val) => {
                                        newBookingForm.setData((data) => ({
                                            ...data,
                                            paymentMethod: val,
                                            paymentStatus: val === 'Banka' ? 'WAITING_PAYMENT' : 'PAID',
                                        }));
                                    }}
                                >
                                    <SelectTrigger className="font-medium bg-background">
                                        <SelectValue placeholder="Ödeme tipi seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cari Hesap">
                                            💼 Cari Hesap (Açık Hesap)
                                        </SelectItem>
                                        <SelectItem value="Banka">
                                            🏦 Banka (Havale / EFT)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[11px] leading-tight mt-1">
                                    {newBookingForm.data.paymentMethod === 'Banka' ? (
                                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                                            ⏳ Statü banka ödemesi gelene kadar <strong>"Ödeme Bekleniyor"</strong> olarak atanır.
                                        </span>
                                    ) : (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                            ✓ Cari anlaşma kapsamında statü otomatik <strong>"Ödendi"</strong> olarak atanır.
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="font-semibold text-foreground">Ödeme Tutarı / Navlun (€)</Label>
                                <Input
                                    type="number"
                                    value={newBookingForm.data.paymentAmountEur}
                                    onChange={(e) => newBookingForm.setData('paymentAmountEur', parseFloat(e.target.value) || 0)}
                                    placeholder="1450"
                                    className="bg-background font-mono"
                                />
                                <div className="flex items-center gap-2 pt-1 text-[11px]">
                                    <span className="text-muted-foreground">Oluşacak Bilet Statüsü:</span>
                                    {newBookingForm.data.paymentMethod === 'Banka' ? (
                                        <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium">
                                            ⏳ Ödeme Bekleniyor
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">
                                            ✓ Ödendi
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Çekici Plakası *</Label>
                                <Input
                                    placeholder="34 ABC 123"
                                    value={newBookingForm.data.truckPlate}
                                    onChange={(e) => newBookingForm.setData('truckPlate', e.target.value.toUpperCase())}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Dorse Plakası</Label>
                                <Input
                                    placeholder="34 XYZ 789"
                                    value={newBookingForm.data.trailerPlate}
                                    onChange={(e) => newBookingForm.setData('trailerPlate', e.target.value.toUpperCase())}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Sürücü Adı Soyadı</Label>
                                <Input
                                    placeholder="Ad Soyad"
                                    value={newBookingForm.data.driverName}
                                    onChange={(e) => newBookingForm.setData('driverName', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Sürücü Telefon</Label>
                                <Input
                                    placeholder="+90 5XX XXX XX XX"
                                    value={newBookingForm.data.driverPhone}
                                    onChange={(e) => newBookingForm.setData('driverPhone', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="sm:col-span-2 space-y-1.5">
                                <Label>Araç Tipi / Kategori</Label>
                                <Select
                                    value={newBookingForm.data.category}
                                    onValueChange={(val) => newBookingForm.setData('category', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.name}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Uzunluk (Metre)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={newBookingForm.data.lengthMeters}
                                    onChange={(e) => newBookingForm.setData('lengthMeters', parseFloat(e.target.value) || 0)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Ağırlık (Ton)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={newBookingForm.data.weightTon}
                                    onChange={(e) => newBookingForm.setData('weightTon', parseFloat(e.target.value) || 0)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pt-1">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isReefer"
                                    checked={newBookingForm.data.isReefer}
                                    onCheckedChange={(checked) => newBookingForm.setData('isReefer', !!checked)}
                                />
                                <Label htmlFor="isReefer" className="text-sm font-medium">
                                    Frigo / Elektrik Bağlantısı Gereklidir ⚡
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isAdr"
                                    checked={newBookingForm.data.isAdr}
                                    onCheckedChange={(checked) => newBookingForm.setData('isAdr', !!checked)}
                                />
                                <Label htmlFor="isAdr" className="text-sm font-medium">
                                    ADR / Tehlikeli Madde ☣️
                                </Label>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Yük Açıklaması / Ticari Tanım</Label>
                            <Input
                                value={newBookingForm.data.cargoDescription}
                                onChange={(e) => newBookingForm.setData('cargoDescription', e.target.value)}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsNewBookingOpen(false)}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={newBookingForm.processing} className="bg-blue-600 hover:bg-blue-700">
                                {newBookingForm.processing ? 'Oluşturuluyor...' : 'Rezervasyonu Aç'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 2. Edit Booking Dialog */}
            <Dialog open={!!editingBooking} onOpenChange={(open) => !open && setEditingBooking(null)}>
                <DialogContent className="max-w-3xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Bilet Düzenle ({editingBooking?.id})</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateBooking} className="space-y-3.5">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Çekici Plaka</Label>
                                <Input
                                    value={editBookingForm.data.truckPlate}
                                    onChange={(e) => editBookingForm.setData('truckPlate', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Dorse Plaka</Label>
                                <Input
                                    value={editBookingForm.data.trailerPlate}
                                    onChange={(e) => editBookingForm.setData('trailerPlate', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Sürücü</Label>
                                <Input
                                    value={editBookingForm.data.driverName}
                                    onChange={(e) => editBookingForm.setData('driverName', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Telefon</Label>
                                <Input
                                    value={editBookingForm.data.driverPhone}
                                    onChange={(e) => editBookingForm.setData('driverPhone', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Lojistik Firması</Label>
                                <Input
                                    value={editBookingForm.data.shipper}
                                    onChange={(e) => editBookingForm.setData('shipper', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Kategori</Label>
                                <Input
                                    value={editBookingForm.data.category}
                                    onChange={(e) => editBookingForm.setData('category', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label>Metre (LM)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={editBookingForm.data.lengthMeters}
                                    onChange={(e) => editBookingForm.setData('lengthMeters', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Tonaj</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={editBookingForm.data.weightTon}
                                    onChange={(e) => editBookingForm.setData('weightTon', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Ücret (€)</Label>
                                <Input
                                    type="number"
                                    value={editBookingForm.data.paymentAmountEur}
                                    onChange={(e) => editBookingForm.setData('paymentAmountEur', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/20">
                            <div className="space-y-1.5">
                                <Label>Ödeme Tipi</Label>
                                <Select
                                    value={editBookingForm.data.paymentMethod}
                                    onValueChange={(val) => {
                                        editBookingForm.setData((data) => ({
                                            ...data,
                                            paymentMethod: val,
                                            paymentStatus: val === 'Banka' && data.paymentStatus !== 'PAID' ? 'WAITING_PAYMENT' : data.paymentStatus,
                                        }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cari Hesap">💼 Cari Hesap (Açık Hesap)</SelectItem>
                                        <SelectItem value="Banka">🏦 Banka (Havale / EFT)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Ödeme Durumu</Label>
                                <Select
                                    value={editBookingForm.data.paymentStatus}
                                    onValueChange={(val) => editBookingForm.setData('paymentStatus', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PAID">✓ PAID (Ödendi)</SelectItem>
                                        <SelectItem value="WAITING_PAYMENT">⏳ WAITING_PAYMENT (Ödeme Bekleniyor)</SelectItem>
                                        <SelectItem value="PENDING_APPROVAL">⚠️ PENDING_APPROVAL (Risk / Onay Bekliyor)</SelectItem>
                                        <SelectItem value="DISPUTED_BLOCKED">🛑 DISPUTED_BLOCKED (Riskli / Askıda)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Biniş Durumu</Label>
                                <Select
                                    value={editBookingForm.data.boardingStatus}
                                    onValueChange={(val) => editBookingForm.setData('boardingStatus', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="WAITING_APPROVAL">WAITING_APPROVAL</SelectItem>
                                        <SelectItem value="READY_TO_BOARD">READY_TO_BOARD</SelectItem>
                                        <SelectItem value="INCLUDED">INCLUDED (Gemide)</SelectItem>
                                        <SelectItem value="FAILED_BOARDING">FAILED_BOARDING</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Saha Durumu</Label>
                                <Input
                                    value={editBookingForm.data.status}
                                    onChange={(e) => editBookingForm.setData('status', e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setEditingBooking(null)}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={editBookingForm.processing} className="bg-blue-600 hover:bg-blue-700">
                                {editBookingForm.processing ? 'Kaydediliyor...' : 'Güncelle'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 3. Risk Approval Dialog */}
            <Dialog open={!!riskBooking} onOpenChange={(open) => !open && setRiskBooking(null)}>
                <DialogContent className="max-w-lg sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>İstisnai Risk Onayı ({riskBooking?.truckPlate})</DialogTitle>
                        <DialogDescription>
                            Cari risk limit aşımını manuel onaylayarak aracı binişe açın.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRiskApproval} className="space-y-3.5">
                        <div className="space-y-1.5">
                            <Label>Onaylayan Yetkili</Label>
                            <Input
                                value={riskForm.data.approver}
                                onChange={(e) => riskForm.setData('approver', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>İstisna Gerekçesi & Teminat Notu</Label>
                            <Textarea
                                value={riskForm.data.reason}
                                onChange={(e) => riskForm.setData('reason', e.target.value)}
                                required
                            />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setRiskBooking(null)}>
                                Vazgeç
                            </Button>
                            <Button type="submit" disabled={riskForm.processing} className="bg-emerald-600 hover:bg-emerald-700">
                                {riskForm.processing ? 'Onaylanıyor...' : 'Riski Onayla & Dahil Et'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 4. Failed Boarding Dialog */}
            <Dialog open={!!failedBoardingBooking} onOpenChange={(open) => !open && setFailedBoardingBooking(null)}>
                <DialogContent className="max-w-lg sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Biniş İptal Tutanağı ({failedBoardingBooking?.truckPlate})</DialogTitle>
                        <DialogDescription>
                            Aracın gemiye binememe / iptal edilme tutanağını oluşturun.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFailedBoarding} className="space-y-3.5">
                        <div className="space-y-1.5">
                            <Label>Kusur Sorumluluğu</Label>
                            <Select
                                value={failedBoardingForm.data.fault}
                                onValueChange={(val) => failedBoardingForm.setData('fault', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FORW_FAULT">Firma / Sürücü Kusuru</SelectItem>
                                    <SelectItem value="PORT_FAULT">Terminal / Liman Kusuru</SelectItem>
                                    <SelectItem value="CUSTOMS_FAULT">Gümrük Reddi / İnceleme</SelectItem>
                                    <SelectItem value="FORCE_MAJEURE">Mücbir Sebep (Hava vs.)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>İptal Gerekçesi</Label>
                            <Input
                                value={failedBoardingForm.data.reason}
                                onChange={(e) => failedBoardingForm.setData('reason', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Detaylı Notlar</Label>
                            <Textarea
                                value={failedBoardingForm.data.notes}
                                onChange={(e) => failedBoardingForm.setData('notes', e.target.value)}
                            />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setFailedBoardingBooking(null)}>
                                Vazgeç
                            </Button>
                            <Button type="submit" disabled={failedBoardingForm.processing} variant="destructive">
                                {failedBoardingForm.processing ? 'İşleniyor...' : 'İptal Tutanağını Kaydet'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 5. Bulk Booking Dialog */}
            <Dialog open={isBulkBookingOpen} onOpenChange={setIsBulkBookingOpen}>
                <DialogContent className="max-w-4xl sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Toplu Çoklu Rezervasyon Aç</DialogTitle>
                        <DialogDescription>
                            Aynı firma veya filo için tek seferde birden fazla araca hızlı bilet oluşturun.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBulkSubmit} className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label>Hedef Sefer</Label>
                                <Select
                                    value={bulkBookingForm.data.voyageId}
                                    onValueChange={(val) => bulkBookingForm.setData('voyageId', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {voyages.map((v) => (
                                            <SelectItem key={v.id} value={v.id}>
                                                🚢 {v.id} ({v.vesselName}) {v.departureTime ? `— 📅 ${v.departureTime}` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Lojistik Firması</Label>
                                <Select
                                    value={bulkBookingForm.data.shipper}
                                    onValueChange={(val) => bulkBookingForm.setData('shipper', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {forwarders.map((f) => (
                                            <SelectItem key={f.id} value={f.name}>
                                                {f.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Ödeme Tipi</Label>
                                <Select
                                    value={bulkBookingForm.data.paymentMethod}
                                    onValueChange={(val) => bulkBookingForm.setData('paymentMethod', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cari Hesap">💼 Cari Hesap (Ödendi)</SelectItem>
                                        <SelectItem value="Banka">🏦 Banka (Ödeme Bekleniyor)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Araç Listesi ({bulkBookingForm.data.vehicles.length} Araç)
                                </Label>
                                <Button type="button" variant="outline" size="sm" onClick={addBulkRow}>
                                    <Plus className="mr-1 h-3.5 w-3.5" /> Araç Ekle
                                </Button>
                            </div>

                            <div className="rounded-md border p-2 space-y-2 bg-muted/20">
                                {bulkBookingForm.data.vehicles.map((v, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-card p-2 rounded border text-xs">
                                        <div className="col-span-1 font-mono font-bold text-muted-foreground text-center">
                                            #{idx + 1}
                                        </div>
                                        <div className="col-span-3">
                                            <Input
                                                placeholder="Çekici Plaka *"
                                                value={v.truckPlate}
                                                onChange={(e) => handleBulkVehicleChange(idx, 'truckPlate', e.target.value.toUpperCase())}
                                                className="h-8 text-xs font-mono font-semibold"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                placeholder="Dorse Plaka"
                                                value={v.trailerPlate}
                                                onChange={(e) => handleBulkVehicleChange(idx, 'trailerPlate', e.target.value.toUpperCase())}
                                                className="h-8 text-xs font-mono"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <Input
                                                placeholder="Sürücü Adı"
                                                value={v.driverName}
                                                onChange={(e) => handleBulkVehicleChange(idx, 'driverName', e.target.value)}
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                placeholder="Telefon"
                                                value={v.driverPhone}
                                                onChange={(e) => handleBulkVehicleChange(idx, 'driverPhone', e.target.value)}
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                        <div className="col-span-1 text-center">
                                            <span className="font-mono text-muted-foreground">16.5m</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsBulkBookingOpen(false)}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={bulkBookingForm.processing} className="bg-blue-600 hover:bg-blue-700">
                                {bulkBookingForm.processing ? 'Oluşturuluyor...' : 'Toplu Rezervasyonu Kaydet'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
