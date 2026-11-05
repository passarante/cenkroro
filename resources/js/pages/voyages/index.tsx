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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Booking, Port, Vessel, Voyage, VoyageRoute } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Calendar,
    Compass,
    Edit2,
    Layers,
    LayoutGrid,
    MapPin,
    Plus,
    Route as RouteIcon,
    Ship,
    Ticket,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    DataTableColumnHeader,
    DataTablePagination,
    DataTableSearch,
    DataTableViewToggle,
} from '@/components/data-table';
import { useDataTable } from '@/hooks/use-data-table';

interface VoyagesIndexProps {
    voyages: Voyage[];
    fleet: Vessel[];
    ports: Port[];
    routes?: VoyageRoute[];
    bookings: Booking[];
    activeVoyage?: Voyage | null;
    subTab?: 'schedule' | 'fleet' | 'ports' | 'routes';
}

const getVesselOperationalStatus = (vessel: Vessel, allVoyages: Voyage[]): string => {
    if (['Bakımda', 'Tersanede', 'Hizmet Dışı'].includes(vessel.status)) {
        return vessel.status;
    }

    const activeVoyage = allVoyages.find(
        (v) => (v.vesselId === vessel.id || v.vesselName === vessel.name) && !v.status?.includes('Tamamlandı')
    );

    if (!activeVoyage) {
        return 'Limanda';
    }

    if (activeVoyage.status?.includes('Seyirde')) {
        return 'Seyirde (Underway)';
    }

    if (activeVoyage.status?.includes('Yükleme')) {
        return 'Limanda (Yüklemede)';
    }

    if (activeVoyage.status?.includes('Tahliye')) {
        return 'Limanda (Tahliyede)';
    }

    if (activeVoyage.status?.includes('Planlandı')) {
        return 'Limanda (Planlandı)';
    }

    return 'Limanda';
};

const formatForDateTimeLocal = (dateStr?: string): string => {
    if (!dateStr) return '';
    const trimmed = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(trimmed)) {
        return trimmed.replace(' ', 'T').slice(0, 16);
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    return '';
};

export default function VoyagesIndex({
    voyages = [],
    fleet = [],
    ports = [],
    routes = [],
    bookings = [],
    subTab = 'schedule',
}: VoyagesIndexProps) {
    // Data Table Hooks for Schedule, Fleet, Ports, and Routes
    const scheduleTable = useDataTable<Voyage>({
        data: voyages,
        initialSortKey: 'id',
        initialSortDir: 'desc',
        initialPageSize: 10,
        initialViewMode: 'table',
        searchFields: ['id', 'vesselName', 'route', 'departurePort', 'arrivalPort', 'status', 'berth'],
    });

    const fleetTable = useDataTable<Vessel>({
        data: fleet,
        initialSortKey: 'name',
        initialSortDir: 'asc',
        initialPageSize: 10,
        initialViewMode: 'table',
        searchFields: ['id', 'name', 'flag', 'imo', 'status', 'captain', 'currentPort'],
    });

    const portsTable = useDataTable<Port>({
        data: ports,
        initialSortKey: 'name',
        initialSortDir: 'asc',
        initialPageSize: 10,
        initialViewMode: 'table',
        searchFields: ['id', 'name', 'code', 'country', 'city', 'type', 'berth'],
    });

    const routesTable = useDataTable<VoyageRoute>({
        data: routes,
        initialSortKey: 'id',
        initialSortDir: 'asc',
        initialPageSize: 10,
        initialViewMode: 'table',
        searchFields: ['id', 'name', 'code', 'departurePort', 'arrivalPort', 'description', 'status'],
    });

    // Dialog states
    const [isNewVoyageOpen, setIsNewVoyageOpen] = useState(false);
    const [editingVoyage, setEditingVoyage] = useState<Voyage | null>(null);
    const [selectedRouteId, setSelectedRouteId] = useState<string>('');
    const [selectedEditRouteId, setSelectedEditRouteId] = useState<string>('');

    const [isNewRouteOpen, setIsNewRouteOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<VoyageRoute | null>(null);

    const [isNewVesselOpen, setIsNewVesselOpen] = useState(false);
    const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
    const [stowageVessel, setStowageVessel] = useState<Vessel | null>(null);

    const [isNewPortOpen, setIsNewPortOpen] = useState(false);

    const defaultDeparture = ports.find((p) => p.type === 'Kalkış')?.name || ports[0]?.name || '';
    const defaultArrival = ports.find((p) => p.name !== defaultDeparture && p.type === 'Varış')?.name
        || ports.find((p) => p.name !== defaultDeparture)?.name
        || '';

    // New Voyage Form
    const newVoyageForm = useForm({
        voyageNumber: 'VOY-' + Math.floor(100 + Math.random() * 900),
        vesselId: fleet[0]?.id || '',
        departurePort: defaultDeparture,
        arrivalPort: defaultArrival,
        departureTime: '2026-11-01 22:00',
        estimatedArrival: '2026-11-04 10:00',
        durationHours: 60.0,
        berth: 'Rıhtım 1',
    });

    const openNewVoyageModal = () => {
        setSelectedRouteId('');
        const depPort = ports.find((p) => p.type === 'Kalkış')?.name || ports[0]?.name || '';
        const arrPort = ports.find((p) => p.name !== depPort && p.type === 'Varış')?.name
            || ports.find((p) => p.name !== depPort)?.name
            || '';

        newVoyageForm.setData({
            voyageNumber: 'VOY-' + Math.floor(100 + Math.random() * 900),
            vesselId: fleet[0]?.id || '',
            departurePort: depPort,
            arrivalPort: arrPort,
            departureTime: '2026-11-01 22:00',
            estimatedArrival: '2026-11-04 10:00',
            durationHours: 60.0,
            berth: 'Rıhtım 1',
        });
        setIsNewVoyageOpen(true);
    };

    const handleSelectRouteForNewVoyage = (routeId: string) => {
        setSelectedRouteId(routeId);
        const found = routes.find((r) => r.id === routeId);
        if (!found) return;

        newVoyageForm.setData((prev) => {
            let estArrival = prev.estimatedArrival;
            if (prev.departureTime) {
                const depDate = new Date(prev.departureTime);
                if (!isNaN(depDate.getTime())) {
                    const arrDate = new Date(depDate.getTime() + (found.durationHours || 60) * 3600 * 1000);
                    const pad = (n: number) => String(n).padStart(2, '0');
                    estArrival = `${arrDate.getFullYear()}-${pad(arrDate.getMonth() + 1)}-${pad(arrDate.getDate())} ${pad(arrDate.getHours())}:${pad(arrDate.getMinutes())}`;
                }
            }
            return {
                ...prev,
                departurePort: found.departurePort,
                arrivalPort: found.arrivalPort,
                durationHours: found.durationHours || 60.0,
                estimatedArrival: estArrival,
            };
        });
        toast.info(`"${found.name}" rotası seçildi (Liman ve seyir süresi aktarıldı).`);
    };

    const handleDepartureTimeChange = (val: string) => {
        const formatted = val.replace('T', ' ');
        newVoyageForm.setData((prev) => {
            let estArrival = prev.estimatedArrival;
            const depDate = new Date(formatted);
            if (!isNaN(depDate.getTime()) && prev.durationHours > 0) {
                const arrDate = new Date(depDate.getTime() + prev.durationHours * 3600 * 1000);
                const pad = (n: number) => String(n).padStart(2, '0');
                estArrival = `${arrDate.getFullYear()}-${pad(arrDate.getMonth() + 1)}-${pad(arrDate.getDate())} ${pad(arrDate.getHours())}:${pad(arrDate.getMinutes())}`;
            }
            return {
                ...prev,
                departureTime: formatted,
                estimatedArrival: estArrival,
            };
        });
    };

    const handleCreateVoyage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVoyageForm.data.departurePort || !newVoyageForm.data.arrivalPort) {
            toast.error('Lütfen kalkış ve varış limanlarını seçiniz.');
            return;
        }
        if (newVoyageForm.data.departurePort === newVoyageForm.data.arrivalPort) {
            toast.error('Kalkış ve varış limanı aynı olamaz.');
            return;
        }
        newVoyageForm.post('/voyages/store', {
            onSuccess: () => {
                toast.success('Yeni sefer başarıyla oluşturuldu.');
                setIsNewVoyageOpen(false);
                newVoyageForm.reset();
            },
            onError: (errors) => {
                const msg = (errors as Record<string, string>)?.arrivalPort || 'Lütfen zorunlu alanları kontrol ediniz.';
                toast.error(msg);
            },
        });
    };

    // Edit Voyage Form
    const editVoyageForm = useForm({
        vesselId: '',
        route: '',
        departurePort: '',
        arrivalPort: '',
        departureTime: '',
        estimatedArrival: '',
        status: 'Planlandı (Scheduled)',
        totalCapacityLM: 3850,
        durationHours: 60,
        berth: '',
        weatherCondition: '',
    });

    const openEditVoyage = (v: Voyage) => {
        setEditingVoyage(v);
        const matchingRoute = routes.find(
            (r) => r.departurePort === v.departurePort && r.arrivalPort === v.arrivalPort
        );
        setSelectedEditRouteId(matchingRoute?.id || '');

        editVoyageForm.setData({
            vesselId: v.vesselId || '',
            route: v.route || '',
            departurePort: v.departurePort || '',
            arrivalPort: v.arrivalPort || '',
            departureTime: v.departureTime || '',
            estimatedArrival: v.estimatedArrival || '',
            status: v.status || 'Planlandı (Scheduled)',
            totalCapacityLM: v.totalCapacityLM || 3850,
            durationHours: v.durationHours || 60,
            berth: v.berth || '',
            weatherCondition: v.weatherCondition || '',
        });
    };

    const handleSelectRouteForEditVoyage = (routeId: string) => {
        setSelectedEditRouteId(routeId);
        const found = routes.find((r) => r.id === routeId);
        if (!found) return;

        editVoyageForm.setData((prev) => {
            let estArrival = prev.estimatedArrival;
            if (prev.departureTime) {
                const depDate = new Date(prev.departureTime);
                if (!isNaN(depDate.getTime())) {
                    const arrDate = new Date(depDate.getTime() + (found.durationHours || 60) * 3600 * 1000);
                    const pad = (n: number) => String(n).padStart(2, '0');
                    estArrival = `${arrDate.getFullYear()}-${pad(arrDate.getMonth() + 1)}-${pad(arrDate.getDate())} ${pad(arrDate.getHours())}:${pad(arrDate.getMinutes())}`;
                }
            }
            return {
                ...prev,
                departurePort: found.departurePort,
                arrivalPort: found.arrivalPort,
                durationHours: found.durationHours || 60.0,
                estimatedArrival: estArrival,
                route: `${found.departurePort} ➔ ${found.arrivalPort}`,
            };
        });
        toast.info(`"${found.name}" rotası yüklendi.`);
    };

    const handleUpdateVoyage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editVoyageForm.data.departurePort || !editVoyageForm.data.arrivalPort) {
            toast.error('Lütfen kalkış ve varış limanlarını seçiniz.');
            return;
        }
        if (editVoyageForm.data.departurePort === editVoyageForm.data.arrivalPort) {
            toast.error('Kalkış ve varış limanı aynı olamaz.');
            return;
        }
        if (!editingVoyage) return;
        editVoyageForm.post(`/voyages/update/${editingVoyage.id}`, {
            onSuccess: () => {
                toast.success('Sefer bilgileri güncellendi.');
                setEditingVoyage(null);
            },
            onError: (errors) => {
                const msg = (errors as Record<string, string>)?.arrivalPort || 'Güncelleme sırasında hata oluştu.';
                toast.error(msg);
            },
        });
    };

    const handleDeleteVoyage = (id: string) => {
        if (!confirm(`Sefer [${id}] silinsin mi? Bağlı rezervasyonlar boşa çıkarılacaktır.`)) return;
        router.post(`/voyages/destroy/${id}`, {}, {
            onSuccess: () => toast.success('Sefer silindi.'),
            onError: () => toast.error('Silme işleminde hata oluştu.'),
        });
    };

    // New Vessel Form
    const newVesselForm = useForm({
        id: 'VES-' + Math.floor(10 + Math.random() * 90),
        name: '',
        flag: 'TR 🇹🇷',
        imo: '99' + Math.floor(10000 + Math.random() * 90000),
        laneMeters: 3850,
        speedKnots: 21.0,
        reeferPlugs: 180,
        status: 'Limanda',
    });

    const handleCreateVessel = (e: React.FormEvent) => {
        e.preventDefault();
        newVesselForm.post('/voyages/vessel/store', {
            onSuccess: () => {
                toast.success('Yeni gemi filoya eklendi.');
                setIsNewVesselOpen(false);
                newVesselForm.reset();
            },
            onError: () => toast.error('Lütfen alanları kontrol ediniz.'),
        });
    };

    // Edit Vessel Form
    const editVesselForm = useForm({
        name: '',
        flag: '',
        imo: '',
        speedKnots: 20.0,
        reeferPlugs: 180,
        status: '',
        captain: '',
    });

    const openEditVessel = (v: Vessel) => {
        setEditingVessel(v);
        editVesselForm.setData({
            name: v.name,
            flag: v.flag || 'TR 🇹🇷',
            imo: v.imo || '',
            speedKnots: v.speedKnots || 20.0,
            reeferPlugs: v.reeferPlugs || 180,
            status: v.status || 'Aktif',
            captain: v.captain || '',
        });
    };

    const handleUpdateVessel = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingVessel) return;
        editVesselForm.post(`/voyages/vessel/update/${editingVessel.id}`, {
            onSuccess: () => {
                toast.success('Gemi bilgileri güncellendi.');
                setEditingVessel(null);
            },
        });
    };

    const handleDeleteVessel = (v: Vessel) => {
        if (!confirm(`[${v.name}] filodan silinsin mi?`)) return;
        router.post(`/voyages/vessel/destroy/${v.id}`, {}, {
            onSuccess: () => toast.success('Gemi silindi.'),
        });
    };

    // Vessel Stowage Layout Form
    const stowageLayoutForm = useForm({
        stowage_layout_json: '',
    });

    const openStowageModal = (v: Vessel) => {
        setStowageVessel(v);
        stowageLayoutForm.setData({
            stowage_layout_json: JSON.stringify(v.stowage_layout || {}, null, 2),
        });
    };

    const handleUpdateStowageLayout = (e: React.FormEvent) => {
        e.preventDefault();
        if (!stowageVessel) return;
        stowageLayoutForm.post(`/voyages/vessel/stowage/${stowageVessel.id}`, {
            onSuccess: () => {
                toast.success('Gemi istif şablonu güncellendi.');
                setStowageVessel(null);
            },
            onError: () => toast.error('Geçersiz JSON formatı.'),
        });
    };

    // Port Form
    const portForm = useForm({
        id: 'PRT-' + Math.floor(100 + Math.random() * 900),
        name: '',
        code: '',
        country: 'Türkiye',
        city: '',
        type: 'Kalkış',
        berth: 'Rıhtım 1',
    });

    const handleCreatePort = (e: React.FormEvent) => {
        e.preventDefault();
        portForm.post('/voyages/port/store', {
            onSuccess: () => {
                toast.success('Liman başarıyla kaydedildi.');
                setIsNewPortOpen(false);
                portForm.reset();
            },
        });
    };

    const handleDeletePort = (id: string) => {
        if (!confirm(`Liman [${id}] silinsin mi?`)) return;
        router.post(`/voyages/port/destroy/${id}`, {}, {
            onSuccess: () => toast.success('Liman silindi.'),
        });
    };

    // Route Forms & Actions
    const newRouteForm = useForm({
        id: 'ROT-' + Math.floor(10 + Math.random() * 90),
        name: '',
        code: '',
        departurePort: defaultDeparture,
        arrivalPort: defaultArrival,
        durationHours: 60.0,
        distanceNm: 1100,
        description: '',
        status: 'Aktif',
    });

    const editRouteForm = useForm({
        name: '',
        code: '',
        departurePort: '',
        arrivalPort: '',
        durationHours: 60.0,
        distanceNm: 1100,
        description: '',
        status: 'Aktif',
    });

    const openEditRoute = (r: VoyageRoute) => {
        setEditingRoute(r);
        editRouteForm.setData({
            name: r.name,
            code: r.code || '',
            departurePort: r.departurePort,
            arrivalPort: r.arrivalPort,
            durationHours: r.durationHours || 60.0,
            distanceNm: r.distanceNm || 1000,
            description: r.description || '',
            status: r.status || 'Aktif',
        });
    };

    const handleCreateRoute = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRouteForm.data.departurePort || !newRouteForm.data.arrivalPort) {
            toast.error('Lütfen kalkış ve varış limanlarını seçiniz.');
            return;
        }
        if (newRouteForm.data.departurePort === newRouteForm.data.arrivalPort) {
            toast.error('Kalkış ve varış limanı aynı olamaz.');
            return;
        }
        newRouteForm.post('/voyages/route/store', {
            onSuccess: () => {
                toast.success('Yeni rota başarıyla kaydedildi.');
                setIsNewRouteOpen(false);
                newRouteForm.reset({
                    id: 'ROT-' + Math.floor(10 + Math.random() * 90),
                    name: '',
                    code: '',
                    departurePort: defaultDeparture,
                    arrivalPort: defaultArrival,
                    durationHours: 60.0,
                    distanceNm: 1100,
                    description: '',
                    status: 'Aktif',
                });
            },
            onError: (errors) => {
                const msg = (errors as Record<string, string>)?.arrivalPort || 'Lütfen alanları kontrol ediniz.';
                toast.error(msg);
            },
        });
    };

    const handleUpdateRoute = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRoute) return;
        if (!editRouteForm.data.departurePort || !editRouteForm.data.arrivalPort) {
            toast.error('Lütfen kalkış ve varış limanlarını seçiniz.');
            return;
        }
        if (editRouteForm.data.departurePort === editRouteForm.data.arrivalPort) {
            toast.error('Kalkış ve varış limanı aynı olamaz.');
            return;
        }
        editRouteForm.post(`/voyages/route/update/${editingRoute.id}`, {
            onSuccess: () => {
                toast.success('Rota başarıyla güncellendi.');
                setEditingRoute(null);
            },
            onError: (errors) => {
                const msg = (errors as Record<string, string>)?.arrivalPort || 'Lütfen alanları kontrol ediniz.';
                toast.error(msg);
            },
        });
    };

    const handleDeleteRoute = (id: string) => {
        if (!confirm(`Rota [${id}] silinsin mi?`)) return;
        router.post(`/voyages/route/destroy/${id}`, {}, {
            onSuccess: () => toast.success('Rota silindi.'),
            onError: () => toast.error('Silme işleminde hata oluştu.'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Seferler & Filo', href: '/voyages' }]}>
            <Head title="Sefer Programı & Filo Yönetimi - Cenk Ro-Ro" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Sub-tab Navigation Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant={subTab === 'schedule' ? 'default' : 'outline'}
                            size="sm"
                            asChild
                        >
                            <Link href="/voyages?subtab=schedule">
                                <Calendar className="mr-1.5 h-4 w-4" /> Sefer Programı ({voyages.length})
                            </Link>
                        </Button>
                        <Button
                            variant={subTab === 'fleet' ? 'default' : 'outline'}
                            size="sm"
                            asChild
                        >
                            <Link href="/voyages?subtab=fleet">
                                <Ship className="mr-1.5 h-4 w-4" /> Gemi Tanımları & Filo ({fleet.length})
                            </Link>
                        </Button>
                        <Button
                            variant={subTab === 'ports' ? 'default' : 'outline'}
                            size="sm"
                            asChild
                        >
                            <Link href="/voyages?subtab=ports">
                                <MapPin className="mr-1.5 h-4 w-4" /> Liman Tanımları ({ports.length})
                            </Link>
                        </Button>
                        <Button
                            variant={subTab === 'routes' ? 'default' : 'outline'}
                            size="sm"
                            asChild
                        >
                            <Link href="/voyages?subtab=routes">
                                <RouteIcon className="mr-1.5 h-4 w-4" /> Rota Tanımları ({routes.length})
                            </Link>
                        </Button>
                    </div>

                    <div>
                        {subTab === 'schedule' && (
                            <Button
                                onClick={openNewVoyageModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                            >
                                <Plus className="mr-1.5 h-4 w-4" /> Yeni Sefer Tanımla
                            </Button>
                        )}
                        {subTab === 'fleet' && (
                            <Button
                                onClick={() => setIsNewVesselOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                            >
                                <Plus className="mr-1.5 h-4 w-4" /> Yeni Gemi Ekle
                            </Button>
                        )}
                        {subTab === 'ports' && (
                            <Button
                                onClick={() => setIsNewPortOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                            >
                                <Plus className="mr-1.5 h-4 w-4" /> Yeni Liman Ekle
                            </Button>
                        )}
                        {subTab === 'routes' && (
                            <Button
                                onClick={() => setIsNewRouteOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                            >
                                <Plus className="mr-1.5 h-4 w-4" /> Yeni Rota Tanımla
                            </Button>
                        )}
                    </div>
                </div>

                {/* 1. SEFER PROGRAMI GÖRÜNÜMÜ */}
                {subTab === 'schedule' && (
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-lg">
                                        Aktif ve Planlanan Sefer Programı ({scheduleTable.totalItems})
                                    </CardTitle>
                                    <CardDescription>
                                        Pendik, Trieste, Yalova ve Sète hatlarındaki tüm Ro-Ro seferleri
                                    </CardDescription>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <DataTableSearch
                                        value={scheduleTable.searchTerm}
                                        onChange={scheduleTable.setSearchTerm}
                                        placeholder="Sefer no, gemi veya rota ara..."
                                        className="w-48 sm:w-60"
                                    />
                                    <DataTableViewToggle
                                        viewMode={scheduleTable.viewMode}
                                        onViewModeChange={scheduleTable.setViewMode}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {scheduleTable.viewMode === 'table' ? (
                                <div className="rounded-md border overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <DataTableColumnHeader
                                                    title="Sefer No"
                                                    sortKey="id"
                                                    currentSortKey={scheduleTable.sortKey}
                                                    currentSortDir={scheduleTable.sortDir}
                                                    onSort={scheduleTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Gemi"
                                                    sortKey="vesselName"
                                                    currentSortKey={scheduleTable.sortKey}
                                                    currentSortDir={scheduleTable.sortDir}
                                                    onSort={scheduleTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Güzergah / Rota"
                                                    sortKey="route"
                                                    currentSortKey={scheduleTable.sortKey}
                                                    currentSortDir={scheduleTable.sortDir}
                                                    onSort={scheduleTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Kalkış Zamanı"
                                                    sortKey="departureTime"
                                                    currentSortKey={scheduleTable.sortKey}
                                                    currentSortDir={scheduleTable.sortDir}
                                                    onSort={scheduleTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Tahmini Varış"
                                                    sortKey="estimatedArrival"
                                                    currentSortKey={scheduleTable.sortKey}
                                                    currentSortDir={scheduleTable.sortDir}
                                                    onSort={scheduleTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Doluluk / LM"
                                                    sortKey="bookedLM"
                                                    currentSortKey={scheduleTable.sortKey}
                                                    currentSortDir={scheduleTable.sortDir}
                                                    onSort={scheduleTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Rıhtım"
                                                    sortKey="berth"
                                                    currentSortKey={scheduleTable.sortKey}
                                                    currentSortDir={scheduleTable.sortDir}
                                                    onSort={scheduleTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Durum"
                                                    sortKey="status"
                                                    currentSortKey={scheduleTable.sortKey}
                                                    currentSortDir={scheduleTable.sortDir}
                                                    onSort={scheduleTable.handleSort}
                                                />
                                                <TableHead className="text-right whitespace-nowrap">İşlemler</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {scheduleTable.paginatedData.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                                                        Arama kriterlerine uygun sefer bulunamadı.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                scheduleTable.paginatedData.map((v) => {
                                                    const percent = v.totalCapacityLM > 0 ? Math.round((v.bookedLM / v.totalCapacityLM) * 100) : 0;
                                                    const vBookings = bookings.filter((b) => b.voyageId === v.id);

                                                    return (
                                                        <TableRow key={v.id} className="hover:bg-muted/50">
                                                            <TableCell className="font-mono font-bold text-blue-500">
                                                                {v.id}
                                                            </TableCell>
                                                            <TableCell className="font-semibold text-foreground">
                                                                {v.vesselName}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                <span className="font-medium text-foreground">{v.departurePort}</span>
                                                                <span className="text-muted-foreground mx-1">➔</span>
                                                                <span className="font-medium text-foreground">{v.arrivalPort}</span>
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs">{v.departureTime}</TableCell>
                                                            <TableCell className="font-mono text-xs">{v.estimatedArrival}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                                                                        <div
                                                                            className={`h-full rounded-full ${percent >= 90 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="font-mono text-xs font-bold">%{percent}</span>
                                                                    <span className="font-mono text-[11px] text-muted-foreground">({v.bookedLM}/{v.totalCapacityLM}m)</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-xs text-muted-foreground">{v.berth || 'Rıhtım 1'}</TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        v.status.includes('Yükle')
                                                                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-xs'
                                                                            : 'border-purple-500/40 bg-purple-500/10 text-purple-500 text-xs'
                                                                    }
                                                                >
                                                                    {v.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Button variant="outline" size="sm" className="h-7 text-xs px-2" asChild>
                                                                        <Link href={`/bookings?voyage=${v.id}`}>
                                                                            <Ticket className="mr-1 h-3.5 w-3.5 text-blue-500" /> Biletler ({vBookings.length})
                                                                        </Link>
                                                                    </Button>
                                                                    {v.vesselId && (
                                                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild title="Stif Planı">
                                                                            <Link href={`/stowage?vessel=${v.vesselId}`}>
                                                                                <LayoutGrid className="h-3.5 w-3.5 text-teal-500" />
                                                                            </Link>
                                                                        </Button>
                                                                    )}
                                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEditVoyage(v)} title="Düzenle">
                                                                        <Edit2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteVoyage(v.id)} title="Sil">
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
                            ) : (
                                /* Cards for Schedule */
                                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {scheduleTable.paginatedData.length === 0 ? (
                                        <div className="col-span-full py-12 text-center text-muted-foreground">
                                            Arama kriterlerine uygun sefer bulunamadı.
                                        </div>
                                    ) : (
                                        scheduleTable.paginatedData.map((v) => {
                                            const percent = v.totalCapacityLM > 0 ? Math.round((v.bookedLM / v.totalCapacityLM) * 100) : 0;
                                            const vBookings = bookings.filter((b) => b.voyageId === v.id);
                                            const vPaid = vBookings.filter((b) => b.paymentStatus === 'PAID').length;
                                            const vPending = vBookings.filter((b) => b.paymentStatus === 'PENDING_APPROVAL').length;
                                            const vReady = vBookings.filter((b) => b.boardingStatus === 'READY_TO_BOARD').length;
                                            const vLoaded = vBookings.filter((b) => b.boardingStatus === 'INCLUDED').length;

                                            return (
                                                <Card key={v.id} className="flex flex-col justify-between overflow-hidden shadow-sm hover:border-blue-500/40 transition-colors">
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <Badge variant="outline" className="font-mono text-blue-500 border-blue-500/30 mb-1">
                                                                    {v.id}
                                                                </Badge>
                                                                <CardTitle className="text-lg">{v.vesselName}</CardTitle>
                                                            </div>
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    v.status.includes('Yükle')
                                                                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
                                                                        : 'border-purple-500/40 bg-purple-500/10 text-purple-500'
                                                                }
                                                            >
                                                                {v.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mt-2">
                                                            <Compass className="h-3.5 w-3.5" />
                                                            <span>{v.route}</span>
                                                        </div>
                                                    </CardHeader>

                                                    <CardContent className="space-y-4 pt-0">
                                                        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-2.5 text-xs">
                                                            <div>
                                                                <div className="text-[10px] text-muted-foreground uppercase font-semibold">KALKIŞ</div>
                                                                <div className="font-bold text-foreground truncate">{v.departureTime}</div>
                                                                <div className="text-[11px] text-muted-foreground truncate">{v.departurePort}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] text-muted-foreground uppercase font-semibold">TAHMİNİ VARIŞ</div>
                                                                <div className="font-bold text-foreground truncate">{v.estimatedArrival}</div>
                                                                <div className="text-[11px] text-muted-foreground truncate">{v.arrivalPort}</div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="mb-1 flex justify-between text-xs">
                                                                <span className="text-muted-foreground font-medium">Doluluk:</span>
                                                                <span className="font-mono font-bold">
                                                                    {v.bookedLM} LM / {v.totalCapacityLM} LM (%{percent})
                                                                </span>
                                                            </div>
                                                            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                                                <div
                                                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400"
                                                                    style={{ width: `${Math.min(percent, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                                                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                                                                🚢 Gemide: {vLoaded}
                                                            </Badge>
                                                            <Badge variant="outline" className="border-blue-500/30 text-blue-500">
                                                                🟢 Binişe Hazır: {vReady}
                                                            </Badge>
                                                            <Badge variant="outline" className="border-amber-500/30 text-amber-500">
                                                                ⏳ Ödeme Onay: {vPending}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex items-center justify-between border-t pt-3">
                                                            <Button variant="outline" size="sm" asChild>
                                                                <Link href={`/bookings?voyage=${v.id}`}>
                                                                    <Ticket className="mr-1.5 h-3.5 w-3.5" /> Biletler ({vBookings.length})
                                                                </Link>
                                                            </Button>

                                                            <div className="flex gap-1.5">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => openEditVoyage(v)}
                                                                >
                                                                    <Edit2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-destructive hover:bg-destructive/10"
                                                                    onClick={() => handleDeleteVoyage(v.id)}
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

                            <DataTablePagination
                                currentPage={scheduleTable.currentPage}
                                totalPages={scheduleTable.totalPages}
                                pageSize={scheduleTable.pageSize}
                                totalItems={scheduleTable.totalItems}
                                startIndex={scheduleTable.startIndex}
                                endIndex={scheduleTable.endIndex}
                                onPageChange={scheduleTable.setCurrentPage}
                                onPageSizeChange={scheduleTable.setPageSize}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* 2. GEMİ TANIMLARI & FİLO GÖRÜNÜMÜ */}
                {subTab === 'fleet' && (
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-lg">
                                        Filo ve Ro-Ro Gemileri ({fleetTable.totalItems})
                                    </CardTitle>
                                    <CardDescription>
                                        Şirket mülkiyetindeki Ro-Ro gemileri, şerit metre kapasiteleri ve istif güverteleri
                                    </CardDescription>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <DataTableSearch
                                        value={fleetTable.searchTerm}
                                        onChange={fleetTable.setSearchTerm}
                                        placeholder="Gemi adı, bayrak, IMO ara..."
                                        className="w-48 sm:w-60"
                                    />
                                    <DataTableViewToggle
                                        viewMode={fleetTable.viewMode}
                                        onViewModeChange={fleetTable.setViewMode}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {fleetTable.viewMode === 'table' ? (
                                <div className="rounded-md border overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <DataTableColumnHeader
                                                    title="Gemi ID"
                                                    sortKey="id"
                                                    currentSortKey={fleetTable.sortKey}
                                                    currentSortDir={fleetTable.sortDir}
                                                    onSort={fleetTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Gemi Adı & Bayrak"
                                                    sortKey="name"
                                                    currentSortKey={fleetTable.sortKey}
                                                    currentSortDir={fleetTable.sortDir}
                                                    onSort={fleetTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="IMO No"
                                                    sortKey="imo"
                                                    currentSortKey={fleetTable.sortKey}
                                                    currentSortDir={fleetTable.sortDir}
                                                    onSort={fleetTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Kapasite (LM)"
                                                    sortKey="laneMeters"
                                                    currentSortKey={fleetTable.sortKey}
                                                    currentSortDir={fleetTable.sortDir}
                                                    onSort={fleetTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Servis Hızı"
                                                    sortKey="speedKnots"
                                                    currentSortKey={fleetTable.sortKey}
                                                    currentSortDir={fleetTable.sortDir}
                                                    onSort={fleetTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Frigo Priz"
                                                    sortKey="reeferPlugs"
                                                    currentSortKey={fleetTable.sortKey}
                                                    currentSortDir={fleetTable.sortDir}
                                                    onSort={fleetTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Durum"
                                                    sortKey="status"
                                                    currentSortKey={fleetTable.sortKey}
                                                    currentSortDir={fleetTable.sortDir}
                                                    onSort={fleetTable.handleSort}
                                                />
                                                <TableHead>Güverte / Şerit</TableHead>
                                                <TableHead className="text-right whitespace-nowrap">İşlemler</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {fleetTable.paginatedData.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                                                        Arama kriterlerine uygun gemi bulunamadı.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                fleetTable.paginatedData.map((f) => {
                                                    const layout = f.stowage_layout || {};
                                                    const deckKeys = Object.keys(layout);
                                                    let laneCount = 0;
                                                    deckKeys.forEach((dk) => {
                                                        laneCount += (layout[dk]?.lanes || []).length;
                                                    });
                                                    const displayStatus = getVesselOperationalStatus(f, voyages);

                                                    return (
                                                        <TableRow key={f.id} className="hover:bg-muted/50">
                                                            <TableCell className="font-mono font-bold text-blue-500">
                                                                {f.id}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-base">{f.flag || '🚢'}</span>
                                                                    <span className="font-semibold text-foreground">{f.name}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs">{f.imo || '-'}</TableCell>
                                                            <TableCell className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                                                {f.laneMeters} LM
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs">{f.speedKnots} Knot</TableCell>
                                                            <TableCell className="font-mono text-xs">{f.reeferPlugs || 180} Adet</TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        displayStatus.includes('Seyirde')
                                                                            ? 'border-blue-500/40 bg-blue-500/10 text-blue-500 text-xs font-semibold'
                                                                            : displayStatus.includes('Yükle') || displayStatus.includes('Tahliye')
                                                                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-xs font-semibold'
                                                                            : 'border-zinc-500/40 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 text-xs font-semibold'
                                                                    }
                                                                >
                                                                    {displayStatus}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="text-xs font-mono font-medium">
                                                                    {deckKeys.length} Güverte / {laneCount} Şerit
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEditVessel(f)} title="Düzenle">
                                                                        <Edit2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteVessel(f)} title="Sil">
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
                            ) : (
                                /* Cards for Fleet */
                                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {fleetTable.paginatedData.length === 0 ? (
                                        <div className="col-span-full py-12 text-center text-muted-foreground">
                                            Arama kriterlerine uygun gemi bulunamadı.
                                        </div>
                                    ) : (
                                        fleetTable.paginatedData.map((f) => {
                                            const layout = f.stowage_layout || {};
                                            const deckKeys = Object.keys(layout);
                                            let laneCount = 0;
                                            deckKeys.forEach((dk) => {
                                                laneCount += (layout[dk]?.lanes || []).length;
                                            });
                                            const displayStatus = getVesselOperationalStatus(f, voyages);

                                            return (
                                                <Card key={f.id} className="flex flex-col justify-between overflow-hidden shadow-sm hover:border-blue-500/40 transition-colors">
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xl">{f.flag || '🚢'}</span>
                                                                    <CardTitle className="text-lg">{f.name}</CardTitle>
                                                                </div>
                                                                <CardDescription className="font-mono text-xs text-blue-500 dark:text-blue-400 mt-1">
                                                                    IMO: {f.imo} | {displayStatus}
                                                                </CardDescription>
                                                            </div>
                                                            <Badge variant="outline" className="font-mono">
                                                                {f.id}
                                                            </Badge>
                                                        </div>
                                                    </CardHeader>

                                                    <CardContent className="space-y-4 pt-0">
                                                        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-2.5 text-xs">
                                                            <div>
                                                                <div className="text-[10px] text-muted-foreground uppercase font-semibold">KAPASİTE (LM)</div>
                                                                <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{f.laneMeters} LM</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] text-muted-foreground uppercase font-semibold">GÜVERTE & ŞERİT</div>
                                                                <div className="font-mono font-bold text-teal-600 dark:text-teal-400">{deckKeys.length} Güverte / {laneCount} Şerit</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] text-muted-foreground uppercase font-semibold">FRİGO PRİZİ</div>
                                                                <div className="font-mono font-bold">{f.reeferPlugs || 180} Adet</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] text-muted-foreground uppercase font-semibold">SERVİS HIZI</div>
                                                                <div className="font-mono font-bold">{f.speedKnots} Knot</div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                                                                Tanımlı İstif Güverteleri:
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {deckKeys.map((dk) => (
                                                                    <Badge key={dk} variant="secondary" className="text-[10px]">
                                                                        ⚓ {dk}: {(layout[dk]?.lanes || []).length} Şerit ({layout[dk]?.clearHeight || 4.8}m)
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-end border-t pt-3">
                                                            <div className="flex gap-1.5">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => openEditVessel(f)}
                                                                    title="Düzenle"
                                                                >
                                                                    <Edit2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-destructive hover:bg-destructive/10"
                                                                    onClick={() => handleDeleteVessel(f)}
                                                                    title="Sil"
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

                            <DataTablePagination
                                currentPage={fleetTable.currentPage}
                                totalPages={fleetTable.totalPages}
                                pageSize={fleetTable.pageSize}
                                totalItems={fleetTable.totalItems}
                                startIndex={fleetTable.startIndex}
                                endIndex={fleetTable.endIndex}
                                onPageChange={fleetTable.setCurrentPage}
                                onPageSizeChange={fleetTable.setPageSize}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* 3. LİMAN TANIMLARI GÖRÜNÜMÜ */}
                {subTab === 'ports' && (
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-lg">Kayıtlı Ro-Ro Liman ve Terminalleri ({portsTable.totalItems})</CardTitle>
                                    <CardDescription>
                                        Sefer rotalarında kalkış ve varış noktası olarak kullanılan resmi limanlar
                                    </CardDescription>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <DataTableSearch
                                        value={portsTable.searchTerm}
                                        onChange={portsTable.setSearchTerm}
                                        placeholder="Liman adı, kod, ülke ara..."
                                        className="w-48 sm:w-60"
                                    />
                                    <DataTableViewToggle
                                        viewMode={portsTable.viewMode}
                                        onViewModeChange={portsTable.setViewMode}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {portsTable.viewMode === 'table' ? (
                                <div className="rounded-md border overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <DataTableColumnHeader
                                                    title="Liman Kodu"
                                                    sortKey="code"
                                                    currentSortKey={portsTable.sortKey}
                                                    currentSortDir={portsTable.sortDir}
                                                    onSort={portsTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Liman & Terminal Adı"
                                                    sortKey="name"
                                                    currentSortKey={portsTable.sortKey}
                                                    currentSortDir={portsTable.sortDir}
                                                    onSort={portsTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Ülke / Şehir"
                                                    sortKey="country"
                                                    currentSortKey={portsTable.sortKey}
                                                    currentSortDir={portsTable.sortDir}
                                                    onSort={portsTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Tip"
                                                    sortKey="type"
                                                    currentSortKey={portsTable.sortKey}
                                                    currentSortDir={portsTable.sortDir}
                                                    onSort={portsTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Rıhtım"
                                                    sortKey="berth"
                                                    currentSortKey={portsTable.sortKey}
                                                    currentSortDir={portsTable.sortDir}
                                                    onSort={portsTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Gümrük"
                                                    sortKey="hasCustoms"
                                                    currentSortKey={portsTable.sortKey}
                                                    currentSortDir={portsTable.sortDir}
                                                    onSort={portsTable.handleSort}
                                                />
                                                <TableHead className="text-right whitespace-nowrap">İşlemler</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {portsTable.paginatedData.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                                        Arama kriterlerine uygun liman bulunamadı.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                portsTable.paginatedData.map((p) => (
                                                    <TableRow key={p.id}>
                                                        <TableCell className="font-mono font-bold text-blue-500">
                                                            {p.code}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                                                        <TableCell>{p.country} {p.city ? `(${p.city})` : ''}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className={p.type === 'Kalkış' ? 'border-blue-500/30 text-blue-500' : 'border-teal-500/30 text-teal-500'}>
                                                                {p.type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">{p.berth || 'Rıhtım 1'}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                                                                ✓ Aktif
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleDeletePort(p.id)}
                                                                title="Sil"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                /* Cards for Ports */
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {portsTable.paginatedData.length === 0 ? (
                                        <div className="col-span-full py-12 text-center text-muted-foreground">
                                            Arama kriterlerine uygun liman bulunamadı.
                                        </div>
                                    ) : (
                                        portsTable.paginatedData.map((p) => (
                                            <Card key={p.id} className="flex flex-col justify-between overflow-hidden shadow-2xs hover:border-blue-500/40 transition-colors">
                                                <div className="p-4 space-y-3">
                                                    <div className="flex items-start justify-between border-b pb-2.5">
                                                        <div>
                                                            <Badge variant="outline" className="font-mono text-xs text-blue-500 border-blue-500/30 mb-1">
                                                                {p.code}
                                                            </Badge>
                                                            <CardTitle className="text-base font-bold">{p.name}</CardTitle>
                                                        </div>
                                                        <Badge variant="outline" className={p.type === 'Kalkış' ? 'border-blue-500/30 text-blue-500 text-xs' : 'border-teal-500/30 text-teal-500 text-xs'}>
                                                            {p.type}
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-1.5 text-xs">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Ülke / Şehir:</span>
                                                            <span className="font-medium">{p.country} {p.city ? `(${p.city})` : ''}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Rıhtım:</span>
                                                            <span className="font-mono">{p.berth || 'Rıhtım 1'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Gümrük Hattı:</span>
                                                            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[10px]">
                                                                ✓ Aktif Gümrük
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-end border-t bg-muted/20 px-3 py-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeletePort(p.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Sil
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            )}

                            <DataTablePagination
                                currentPage={portsTable.currentPage}
                                totalPages={portsTable.totalPages}
                                pageSize={portsTable.pageSize}
                                totalItems={portsTable.totalItems}
                                startIndex={portsTable.startIndex}
                                endIndex={portsTable.endIndex}
                                onPageChange={portsTable.setCurrentPage}
                                onPageSizeChange={portsTable.setPageSize}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* 4. ROTA TANIMLARI GÖRÜNÜMÜ */}
                {subTab === 'routes' && (
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-lg">
                                        Tanımlı Ro-Ro Sefer Rotaları ({routesTable.totalItems})
                                    </CardTitle>
                                    <CardDescription>
                                        Sefer programında kullanılan standart deniz hatları, liman çiftleri ve tahmini seyir süreleri
                                    </CardDescription>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <DataTableSearch
                                        value={routesTable.searchTerm}
                                        onChange={routesTable.setSearchTerm}
                                        placeholder="Rota adı, kod, liman ara..."
                                        className="w-48 sm:w-60"
                                    />
                                    <DataTableViewToggle
                                        viewMode={routesTable.viewMode}
                                        onViewModeChange={routesTable.setViewMode}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {routesTable.viewMode === 'table' ? (
                                <div className="rounded-md border overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <DataTableColumnHeader
                                                    title="Rota Kodu"
                                                    sortKey="code"
                                                    currentSortKey={routesTable.sortKey}
                                                    currentSortDir={routesTable.sortDir}
                                                    onSort={routesTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Rota Tanımı"
                                                    sortKey="name"
                                                    currentSortKey={routesTable.sortKey}
                                                    currentSortDir={routesTable.sortDir}
                                                    onSort={routesTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Kalkış Limanı"
                                                    sortKey="departurePort"
                                                    currentSortKey={routesTable.sortKey}
                                                    currentSortDir={routesTable.sortDir}
                                                    onSort={routesTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Varış Limanı"
                                                    sortKey="arrivalPort"
                                                    currentSortKey={routesTable.sortKey}
                                                    currentSortDir={routesTable.sortDir}
                                                    onSort={routesTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Tahmini Süre"
                                                    sortKey="durationHours"
                                                    currentSortKey={routesTable.sortKey}
                                                    currentSortDir={routesTable.sortDir}
                                                    onSort={routesTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Mesafe (NM)"
                                                    sortKey="distanceNm"
                                                    currentSortKey={routesTable.sortKey}
                                                    currentSortDir={routesTable.sortDir}
                                                    onSort={routesTable.handleSort}
                                                />
                                                <DataTableColumnHeader
                                                    title="Durum"
                                                    sortKey="status"
                                                    currentSortKey={routesTable.sortKey}
                                                    currentSortDir={routesTable.sortDir}
                                                    onSort={routesTable.handleSort}
                                                />
                                                <TableHead className="text-right whitespace-nowrap">İşlemler</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {routesTable.paginatedData.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                                        Arama kriterlerine uygun rota tanımı bulunamadı.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                routesTable.paginatedData.map((r) => (
                                                    <TableRow key={r.id}>
                                                        <TableCell className="font-mono font-bold text-blue-500">
                                                            {r.code || r.id}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-semibold text-foreground">{r.name}</div>
                                                            {r.description && (
                                                                <div className="text-xs text-muted-foreground line-clamp-1">{r.description}</div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-medium">{r.departurePort}</TableCell>
                                                        <TableCell className="font-medium">{r.arrivalPort}</TableCell>
                                                        <TableCell className="font-mono">{r.durationHours} saat</TableCell>
                                                        <TableCell className="font-mono text-muted-foreground">
                                                            {r.distanceNm ? `${r.distanceNm} NM` : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    r.status === 'Aktif'
                                                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                                                                        : 'border-slate-500/30 text-slate-500'
                                                                }
                                                            >
                                                                {r.status === 'Aktif' ? '✓ Aktif' : 'Pasif'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right whitespace-nowrap">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => openEditRoute(r)}
                                                                    title="Düzenle"
                                                                >
                                                                    <Edit2 className="h-4 w-4 text-blue-600" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                                                    onClick={() => handleDeleteRoute(r.id)}
                                                                    title="Sil"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
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
                                /* Cards for Routes */
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {routesTable.paginatedData.length === 0 ? (
                                        <div className="col-span-full py-12 text-center text-muted-foreground">
                                            Arama kriterlerine uygun rota tanımı bulunamadı.
                                        </div>
                                    ) : (
                                        routesTable.paginatedData.map((r) => (
                                            <Card key={r.id} className="flex flex-col justify-between overflow-hidden shadow-2xs hover:border-blue-500/40 transition-colors">
                                                <div className="p-4 space-y-3">
                                                    <div className="flex items-start justify-between border-b pb-2.5">
                                                        <div>
                                                            <Badge variant="outline" className="font-mono text-xs text-blue-500 border-blue-500/30 mb-1">
                                                                {r.code || r.id}
                                                            </Badge>
                                                            <CardTitle className="text-base font-bold">{r.name}</CardTitle>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                r.status === 'Aktif'
                                                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs'
                                                                    : 'border-slate-500/30 text-slate-500 text-xs'
                                                            }
                                                        >
                                                            {r.status}
                                                        </Badge>
                                                    </div>

                                                    <div className="rounded-md bg-muted/40 p-2.5 space-y-1.5 text-xs">
                                                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                                                            <span className="text-blue-500 font-bold">Kalkış:</span> {r.departurePort}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                                                            <span className="text-emerald-500 font-bold">Varış:</span> {r.arrivalPort}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                                        <div className="rounded border p-2 text-center">
                                                            <span className="text-muted-foreground block text-[10px]">Seyir Süresi</span>
                                                            <span className="font-mono font-bold text-foreground">{r.durationHours} saat</span>
                                                        </div>
                                                        <div className="rounded border p-2 text-center">
                                                            <span className="text-muted-foreground block text-[10px]">Mesafe</span>
                                                            <span className="font-mono font-bold text-foreground">{r.distanceNm ? `${r.distanceNm} NM` : '-'}</span>
                                                        </div>
                                                    </div>

                                                    {r.description && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2 italic">
                                                            "{r.description}"
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-end gap-1 border-t bg-muted/20 px-3 py-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs text-blue-600 hover:bg-blue-50"
                                                        onClick={() => openEditRoute(r)}
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Düzenle
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeleteRoute(r.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Sil
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            )}

                            <DataTablePagination
                                currentPage={routesTable.currentPage}
                                totalPages={routesTable.totalPages}
                                pageSize={routesTable.pageSize}
                                totalItems={routesTable.totalItems}
                                startIndex={routesTable.startIndex}
                                endIndex={routesTable.endIndex}
                                onPageChange={routesTable.setCurrentPage}
                                onPageSizeChange={routesTable.setPageSize}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* MODALS */}
            {/* New Voyage Dialog */}
            <Dialog open={isNewVoyageOpen} onOpenChange={setIsNewVoyageOpen}>
                <DialogContent className="max-w-2xl sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Yeni Sefer Tanımla</DialogTitle>
                        <DialogDescription>
                            Programa yeni sefer ekleyip bilet satışına açın.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateVoyage} className="space-y-3.5">
                        <div className="space-y-1.5">
                            <Label htmlFor="voyageNumber">Sefer No (Kod)</Label>
                            <Input
                                id="voyageNumber"
                                value={newVoyageForm.data.voyageNumber}
                                onChange={(e) => newVoyageForm.setData('voyageNumber', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="vesselId">Gemi Seçimi</Label>
                            <Select
                                value={newVoyageForm.data.vesselId}
                                onValueChange={(val) => newVoyageForm.setData('vesselId', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Gemi seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fleet.map((v) => (
                                        <SelectItem key={v.id} value={v.id}>
                                            {v.name} ({v.laneMeters} LM)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tanımlı Hazır Rota Seçimi */}
                        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="quickRouteSelect" className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                                    <RouteIcon className="h-3.5 w-3.5" />
                                    Tanımlı Rota Seçimi (Otomatik Doldur)
                                </Label>
                                {selectedRouteId && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRouteId('')}
                                        className="text-[11px] text-muted-foreground hover:text-foreground underline"
                                    >
                                        Seçimi Temizle
                                    </button>
                                )}
                            </div>
                            <Select
                                value={selectedRouteId}
                                onValueChange={handleSelectRouteForNewVoyage}
                            >
                                <SelectTrigger id="quickRouteSelect" className="bg-background">
                                    <SelectValue placeholder="Kayıtlı rotalardan birini seçin (Liman ve süre otomatik dolar)..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {routes.map((r) => (
                                        <SelectItem key={r.id} value={r.id}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-foreground">{r.name}</span>
                                                {r.code && <Badge variant="secondary" className="text-[10px] py-0 px-1">{r.code}</Badge>}
                                                <span className="text-xs text-muted-foreground font-normal">
                                                    ({r.durationHours} sa {r.distanceNm ? `/ ${r.distanceNm} NM` : ''})
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground">
                                Bir rota seçtiğinizde kalkış/varış limanı ve tahmini varış süresi otomatik olarak hesaplanır.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="departurePort">Kalkış Limanı</Label>
                                <Select
                                    value={newVoyageForm.data.departurePort}
                                    onValueChange={(val) => {
                                        newVoyageForm.setData((prev) => ({
                                            ...prev,
                                            departurePort: val,
                                            arrivalPort: prev.arrivalPort === val ? '' : prev.arrivalPort,
                                        }));
                                    }}
                                >
                                    <SelectTrigger id="departurePort">
                                        <SelectValue placeholder="Kalkış limanı seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {newVoyageForm.data.departurePort && !ports.some((p) => p.name === newVoyageForm.data.departurePort) && (
                                            <SelectItem value={newVoyageForm.data.departurePort}>
                                                {newVoyageForm.data.departurePort}
                                            </SelectItem>
                                        )}
                                        {ports.map((p) => {
                                            const isSelectedAsArrival = p.name === newVoyageForm.data.arrivalPort;
                                            return (
                                                <SelectItem
                                                    key={p.id}
                                                    value={p.name}
                                                    disabled={isSelectedAsArrival}
                                                >
                                                    {p.name} {p.code ? `(${p.code})` : ''} {isSelectedAsArrival ? '⚠️ (Varış Limanı)' : ''}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="arrivalPort">Varış Limanı</Label>
                                <Select
                                    value={newVoyageForm.data.arrivalPort}
                                    onValueChange={(val) => {
                                        newVoyageForm.setData((prev) => ({
                                            ...prev,
                                            arrivalPort: val,
                                            departurePort: prev.departurePort === val ? '' : prev.departurePort,
                                        }));
                                    }}
                                >
                                    <SelectTrigger id="arrivalPort">
                                        <SelectValue placeholder="Varış limanı seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {newVoyageForm.data.arrivalPort && !ports.some((p) => p.name === newVoyageForm.data.arrivalPort) && (
                                            <SelectItem value={newVoyageForm.data.arrivalPort}>
                                                {newVoyageForm.data.arrivalPort}
                                            </SelectItem>
                                        )}
                                        {ports.map((p) => {
                                            const isSelectedAsDeparture = p.name === newVoyageForm.data.departurePort;
                                            return (
                                                <SelectItem
                                                    key={p.id}
                                                    value={p.name}
                                                    disabled={isSelectedAsDeparture}
                                                >
                                                    {p.name} {p.code ? `(${p.code})` : ''} {isSelectedAsDeparture ? '⚠️ (Kalkış Limanı)' : ''}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {newVoyageForm.data.departurePort && newVoyageForm.data.departurePort === newVoyageForm.data.arrivalPort && (
                            <p className="text-xs font-medium text-destructive">
                                ⚠️ Kalkış ve varış limanı aynı olamaz. Lütfen farklı bir varış limanı seçin.
                            </p>
                        )}
                        {ports.length < 2 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                ℹ️ Sistemde kayıtlı yalnızca {ports.length} liman var. Sefer oluşturabilmek için en az 2 farklı liman tanımlanmalıdır.
                            </p>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="departureTime">Kalkış Tarih & Saat</Label>
                                <Input
                                    id="departureTime"
                                    type="datetime-local"
                                    value={formatForDateTimeLocal(newVoyageForm.data.departureTime)}
                                    onChange={(e) => handleDepartureTimeChange(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="estimatedArrival">Tahmini Varış</Label>
                                <Input
                                    id="estimatedArrival"
                                    type="datetime-local"
                                    value={formatForDateTimeLocal(newVoyageForm.data.estimatedArrival)}
                                    onChange={(e) => newVoyageForm.setData('estimatedArrival', e.target.value.replace('T', ' '))}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsNewVoyageOpen(false)}>
                                İptal
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    newVoyageForm.processing ||
                                    !newVoyageForm.data.departurePort ||
                                    !newVoyageForm.data.arrivalPort ||
                                    newVoyageForm.data.departurePort === newVoyageForm.data.arrivalPort
                                }
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {newVoyageForm.processing ? 'Oluşturuluyor...' : 'Seferi Kaydet'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Voyage Dialog */}
            <Dialog open={!!editingVoyage} onOpenChange={(open) => !open && setEditingVoyage(null)}>
                <DialogContent className="max-w-2xl sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Sefer Bilgilerini Düzenle ({editingVoyage?.id})</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateVoyage} className="space-y-3.5">
                        <div className="space-y-1.5">
                            <Label>Gemi</Label>
                            <Select
                                value={editVoyageForm.data.vesselId}
                                onValueChange={(val) => editVoyageForm.setData('vesselId', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {fleet.map((v) => (
                                        <SelectItem key={v.id} value={v.id}>
                                            {v.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tanımlı Hazır Rota Seçimi - Düzenleme */}
                        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="editQuickRouteSelect" className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                                    <RouteIcon className="h-3.5 w-3.5" />
                                    Tanımlı Rota Seçimi (Otomatik Doldur)
                                </Label>
                                {selectedEditRouteId && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedEditRouteId('')}
                                        className="text-[11px] text-muted-foreground hover:text-foreground underline"
                                    >
                                        Seçimi Temizle
                                    </button>
                                )}
                            </div>
                            <Select
                                value={selectedEditRouteId}
                                onValueChange={handleSelectRouteForEditVoyage}
                            >
                                <SelectTrigger id="editQuickRouteSelect" className="bg-background">
                                    <SelectValue placeholder="Kayıtlı rotalardan birini seçin..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {routes.map((r) => (
                                        <SelectItem key={r.id} value={r.id}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-foreground">{r.name}</span>
                                                {r.code && <Badge variant="secondary" className="text-[10px] py-0 px-1">{r.code}</Badge>}
                                                <span className="text-xs text-muted-foreground font-normal">
                                                    ({r.durationHours} sa {r.distanceNm ? `/ ${r.distanceNm} NM` : ''})
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Rota Açıklaması</Label>
                            <Input
                                value={editVoyageForm.data.route}
                                onChange={(e) => editVoyageForm.setData('route', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="editDeparturePort">Kalkış Limanı</Label>
                                <Select
                                    value={editVoyageForm.data.departurePort}
                                    onValueChange={(val) => {
                                        editVoyageForm.setData((prev) => ({
                                            ...prev,
                                            departurePort: val,
                                            arrivalPort: prev.arrivalPort === val ? '' : prev.arrivalPort,
                                            route: `${val} ➔ ${prev.arrivalPort === val ? '...' : prev.arrivalPort || ''}`,
                                        }));
                                    }}
                                >
                                    <SelectTrigger id="editDeparturePort">
                                        <SelectValue placeholder="Kalkış limanı seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {editVoyageForm.data.departurePort && !ports.some((p) => p.name === editVoyageForm.data.departurePort) && (
                                            <SelectItem value={editVoyageForm.data.departurePort}>
                                                {editVoyageForm.data.departurePort}
                                            </SelectItem>
                                        )}
                                        {ports.map((p) => {
                                            const isSelectedAsArrival = p.name === editVoyageForm.data.arrivalPort;
                                            return (
                                                <SelectItem
                                                    key={p.id}
                                                    value={p.name}
                                                    disabled={isSelectedAsArrival}
                                                >
                                                    {p.name} {p.code ? `(${p.code})` : ''} {isSelectedAsArrival ? '⚠️ (Varış Limanı)' : ''}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="editArrivalPort">Varış Limanı</Label>
                                <Select
                                    value={editVoyageForm.data.arrivalPort}
                                    onValueChange={(val) => {
                                        editVoyageForm.setData((prev) => ({
                                            ...prev,
                                            arrivalPort: val,
                                            departurePort: prev.departurePort === val ? '' : prev.departurePort,
                                            route: `${prev.departurePort === val ? '...' : prev.departurePort || ''} ➔ ${val}`,
                                        }));
                                    }}
                                >
                                    <SelectTrigger id="editArrivalPort">
                                        <SelectValue placeholder="Varış limanı seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {editVoyageForm.data.arrivalPort && !ports.some((p) => p.name === editVoyageForm.data.arrivalPort) && (
                                            <SelectItem value={editVoyageForm.data.arrivalPort}>
                                                {editVoyageForm.data.arrivalPort}
                                            </SelectItem>
                                        )}
                                        {ports.map((p) => {
                                            const isSelectedAsDeparture = p.name === editVoyageForm.data.departurePort;
                                            return (
                                                <SelectItem
                                                    key={p.id}
                                                    value={p.name}
                                                    disabled={isSelectedAsDeparture}
                                                >
                                                    {p.name} {p.code ? `(${p.code})` : ''} {isSelectedAsDeparture ? '⚠️ (Kalkış Limanı)' : ''}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {editVoyageForm.data.departurePort && editVoyageForm.data.departurePort === editVoyageForm.data.arrivalPort && (
                            <p className="text-xs font-medium text-destructive">
                                ⚠️ Kalkış ve varış limanı aynı olamaz. Lütfen farklı bir varış limanı seçin.
                            </p>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="editDepartureTime">Kalkış Tarih & Saat</Label>
                                <Input
                                    id="editDepartureTime"
                                    type="datetime-local"
                                    value={formatForDateTimeLocal(editVoyageForm.data.departureTime)}
                                    onChange={(e) => editVoyageForm.setData('departureTime', e.target.value.replace('T', ' '))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="editEstimatedArrival">Tahmini Varış</Label>
                                <Input
                                    id="editEstimatedArrival"
                                    type="datetime-local"
                                    value={formatForDateTimeLocal(editVoyageForm.data.estimatedArrival)}
                                    onChange={(e) => editVoyageForm.setData('estimatedArrival', e.target.value.replace('T', ' '))}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Sefer Durumu</Label>
                            <Select
                                value={editVoyageForm.data.status}
                                onValueChange={(val) => editVoyageForm.setData('status', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Planlandı (Scheduled)">Planlandı (Scheduled)</SelectItem>
                                    <SelectItem value="Yüklemede (Loading)">Yüklemede (Loading)</SelectItem>
                                    <SelectItem value="Seyirde (Underway)">Seyirde (Underway)</SelectItem>
                                    <SelectItem value="Tahliyede (Discharging)">Tahliyede (Discharging)</SelectItem>
                                    <SelectItem value="Tamamlandı (Completed)">Tamamlandı (Completed)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setEditingVoyage(null)}>
                                İptal
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    editVoyageForm.processing ||
                                    !editVoyageForm.data.departurePort ||
                                    !editVoyageForm.data.arrivalPort ||
                                    editVoyageForm.data.departurePort === editVoyageForm.data.arrivalPort
                                }
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {editVoyageForm.processing ? 'Kaydediliyor...' : 'Güncelle'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* New Vessel Dialog */}
            <Dialog open={isNewVesselOpen} onOpenChange={setIsNewVesselOpen}>
                <DialogContent className="max-w-xl sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Yeni Gemi Ekle</DialogTitle>
                        <DialogDescription>Filoya yeni bir Ro-Ro gemisi tescil edin.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateVessel} className="space-y-3.5">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Gemi Kodu (ID)</Label>
                                <Input
                                    value={newVesselForm.data.id}
                                    onChange={(e) => newVesselForm.setData('id', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Bayrak</Label>
                                <Input
                                    value={newVesselForm.data.flag}
                                    onChange={(e) => newVesselForm.setData('flag', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Gemi Adı</Label>
                            <Input
                                placeholder="M/V CENK ..."
                                value={newVesselForm.data.name}
                                onChange={(e) => newVesselForm.setData('name', e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>IMO Numarası</Label>
                                <Input
                                    value={newVesselForm.data.imo}
                                    onChange={(e) => newVesselForm.setData('imo', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Şerit Metre (LM)</Label>
                                <Input
                                    type="number"
                                    value={newVesselForm.data.laneMeters}
                                    onChange={(e) => newVesselForm.setData('laneMeters', parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Hız (Knot)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={newVesselForm.data.speedKnots}
                                    onChange={(e) => newVesselForm.setData('speedKnots', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Frigo Priz Adedi</Label>
                                <Input
                                    type="number"
                                    value={newVesselForm.data.reeferPlugs}
                                    onChange={(e) => newVesselForm.setData('reeferPlugs', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsNewVesselOpen(false)}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={newVesselForm.processing} className="bg-blue-600 hover:bg-blue-700">
                                {newVesselForm.processing ? 'Kaydediliyor...' : 'Gemiyi Kaydet'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Vessel Dialog */}
            <Dialog open={!!editingVessel} onOpenChange={(open) => !open && setEditingVessel(null)}>
                <DialogContent className="max-w-xl sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Gemi Düzenle ({editingVessel?.id})</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateVessel} className="space-y-3.5">
                        <div className="space-y-1.5">
                            <Label>Gemi Adı</Label>
                            <Input
                                value={editVesselForm.data.name}
                                onChange={(e) => editVesselForm.setData('name', e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Bayrak</Label>
                                <Input
                                    value={editVesselForm.data.flag}
                                    onChange={(e) => editVesselForm.setData('flag', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>IMO</Label>
                                <Input
                                    value={editVesselForm.data.imo}
                                    onChange={(e) => editVesselForm.setData('imo', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Hız (Knot)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={editVesselForm.data.speedKnots}
                                    onChange={(e) => editVesselForm.setData('speedKnots', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Frigo Prizi</Label>
                                <Input
                                    type="number"
                                    value={editVesselForm.data.reeferPlugs}
                                    onChange={(e) => editVesselForm.setData('reeferPlugs', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Gemi Kaptanı</Label>
                            <Input
                                value={editVesselForm.data.captain}
                                onChange={(e) => editVesselForm.setData('captain', e.target.value)}
                            />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setEditingVessel(null)}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={editVesselForm.processing} className="bg-blue-600 hover:bg-blue-700">
                                {editVesselForm.processing ? 'Kaydediliyor...' : 'Güncelle'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Vessel Stowage Layout Dialog */}
            <Dialog open={!!stowageVessel} onOpenChange={(open) => !open && setStowageVessel(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Gemi İstif Alanı Şablonu ({stowageVessel?.name})</DialogTitle>
                        <DialogDescription>
                            Güverte, şerit ve kapasite tanımlarını içeren JSON yerleşim şablonu.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateStowageLayout} className="space-y-3.5">
                        <div className="space-y-1.5">
                            <Label>Stowage Layout JSON</Label>
                            <Textarea
                                rows={12}
                                className="font-mono text-xs"
                                value={stowageLayoutForm.data.stowage_layout_json}
                                onChange={(e) => stowageLayoutForm.setData('stowage_layout_json', e.target.value)}
                                required
                            />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setStowageVessel(null)}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={stowageLayoutForm.processing} className="bg-blue-600 hover:bg-blue-700">
                                {stowageLayoutForm.processing ? 'Kaydediliyor...' : 'Şablonu Kaydet'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* New Port Dialog */}
            <Dialog open={isNewPortOpen} onOpenChange={setIsNewPortOpen}>
                <DialogContent className="max-w-xl sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Yeni Liman Tanımla</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreatePort} className="space-y-3.5">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Liman Kodu (UN/LOCODE)</Label>
                                <Input
                                    placeholder="TRPND"
                                    value={portForm.data.code}
                                    onChange={(e) => portForm.setData('code', e.target.value.toUpperCase())}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Tip</Label>
                                <Select
                                    value={portForm.data.type}
                                    onValueChange={(val) => portForm.setData('type', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Kalkış">Kalkış Limanı</SelectItem>
                                        <SelectItem value="Varış">Varış Limanı</SelectItem>
                                        <SelectItem value="Aktarma">Aktarma Limanı</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Liman Adı & Terminal</Label>
                            <Input
                                placeholder="Pendik Ro-Ro Terminali"
                                value={portForm.data.name}
                                onChange={(e) => portForm.setData('name', e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Ülke</Label>
                                <Input
                                    value={portForm.data.country}
                                    onChange={(e) => portForm.setData('country', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Şehir</Label>
                                <Input
                                    value={portForm.data.city}
                                    onChange={(e) => portForm.setData('city', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Varsayılan Rıhtım</Label>
                            <Input
                                value={portForm.data.berth}
                                onChange={(e) => portForm.setData('berth', e.target.value)}
                            />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsNewPortOpen(false)}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={portForm.processing} className="bg-blue-600 hover:bg-blue-700">
                                {portForm.processing ? 'Kaydediliyor...' : 'Limanı Ekle'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* New Route Dialog */}
            <Dialog open={isNewRouteOpen} onOpenChange={setIsNewRouteOpen}>
                <DialogContent className="max-w-xl sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Yeni Rota Tanımla</DialogTitle>
                        <DialogDescription>
                            Sık kullanılan Ro-Ro deniz hatlarını tanımlayın; sefer oluştururken tek tıkla yükleyin.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateRoute} className="space-y-3.5">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Rota Kodu (ID)</Label>
                                <Input
                                    value={newRouteForm.data.id}
                                    onChange={(e) => newRouteForm.setData('id', e.target.value.toUpperCase())}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Kısa Kod (Abrev.)</Label>
                                <Input
                                    placeholder="PDK-TRS"
                                    value={newRouteForm.data.code}
                                    onChange={(e) => newRouteForm.setData('code', e.target.value.toUpperCase())}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Rota Adı / Açıklaması</Label>
                            <Input
                                placeholder="Örn: Pendik ➔ Trieste Ekspres Hattı"
                                value={newRouteForm.data.name}
                                onChange={(e) => newRouteForm.setData('name', e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Kalkış Limanı</Label>
                                <Select
                                    value={newRouteForm.data.departurePort}
                                    onValueChange={(val) => {
                                        newRouteForm.setData((prev) => ({
                                            ...prev,
                                            departurePort: val,
                                            arrivalPort: prev.arrivalPort === val ? '' : prev.arrivalPort,
                                            name: prev.name ? prev.name : `${val} ➔ ${prev.arrivalPort || '...'}`,
                                        }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kalkış limanı seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ports.map((p) => {
                                            const isSelectedArrival = p.name === newRouteForm.data.arrivalPort;
                                            return (
                                                <SelectItem key={p.id} value={p.name} disabled={isSelectedArrival}>
                                                    {p.name} {p.code ? `(${p.code})` : ''} {isSelectedArrival ? '⚠️ (Varış)' : ''}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Varış Limanı</Label>
                                <Select
                                    value={newRouteForm.data.arrivalPort}
                                    onValueChange={(val) => {
                                        newRouteForm.setData((prev) => ({
                                            ...prev,
                                            arrivalPort: val,
                                            departurePort: prev.departurePort === val ? '' : prev.departurePort,
                                            name: prev.name ? prev.name : `${prev.departurePort || '...'} ➔ ${val}`,
                                        }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Varış limanı seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ports.map((p) => {
                                            const isSelectedDeparture = p.name === newRouteForm.data.departurePort;
                                            return (
                                                <SelectItem key={p.id} value={p.name} disabled={isSelectedDeparture}>
                                                    {p.name} {p.code ? `(${p.code})` : ''} {isSelectedDeparture ? '⚠️ (Kalkış)' : ''}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {newRouteForm.data.departurePort && newRouteForm.data.departurePort === newRouteForm.data.arrivalPort && (
                            <p className="text-xs font-medium text-destructive">
                                ⚠️ Kalkış ve varış limanı aynı olamaz.
                            </p>
                        )}

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label>Tahmini Süre (Saat)</Label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    value={newRouteForm.data.durationHours}
                                    onChange={(e) => newRouteForm.setData('durationHours', parseFloat(e.target.value) || 0)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Mesafe (NM)</Label>
                                <Input
                                    type="number"
                                    placeholder="1180"
                                    value={newRouteForm.data.distanceNm}
                                    onChange={(e) => newRouteForm.setData('distanceNm', parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Durum</Label>
                                <Select
                                    value={newRouteForm.data.status}
                                    onValueChange={(val) => newRouteForm.setData('status', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Aktif">Aktif</SelectItem>
                                        <SelectItem value="Pasif">Pasif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Detaylı Açıklama / Hat Notları</Label>
                            <Input
                                placeholder="Örn: Adriyatik ana koridoru, haftalık 6 sefer."
                                value={newRouteForm.data.description}
                                onChange={(e) => newRouteForm.setData('description', e.target.value)}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsNewRouteOpen(false)}>
                                İptal
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    newRouteForm.processing ||
                                    !newRouteForm.data.departurePort ||
                                    !newRouteForm.data.arrivalPort ||
                                    newRouteForm.data.departurePort === newRouteForm.data.arrivalPort
                                }
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {newRouteForm.processing ? 'Kaydediliyor...' : 'Rotayı Kaydet'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Route Dialog */}
            <Dialog open={!!editingRoute} onOpenChange={(open) => !open && setEditingRoute(null)}>
                <DialogContent className="max-w-xl sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Rota Düzenle ({editingRoute?.id})</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateRoute} className="space-y-3.5">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Rota Adı</Label>
                                <Input
                                    value={editRouteForm.data.name}
                                    onChange={(e) => editRouteForm.setData('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Kısa Kod</Label>
                                <Input
                                    value={editRouteForm.data.code}
                                    onChange={(e) => editRouteForm.setData('code', e.target.value.toUpperCase())}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Kalkış Limanı</Label>
                                <Select
                                    value={editRouteForm.data.departurePort}
                                    onValueChange={(val) => {
                                        editRouteForm.setData((prev) => ({
                                            ...prev,
                                            departurePort: val,
                                            arrivalPort: prev.arrivalPort === val ? '' : prev.arrivalPort,
                                        }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ports.map((p) => {
                                            const isSelectedArrival = p.name === editRouteForm.data.arrivalPort;
                                            return (
                                                <SelectItem key={p.id} value={p.name} disabled={isSelectedArrival}>
                                                    {p.name} {p.code ? `(${p.code})` : ''} {isSelectedArrival ? '⚠️ (Varış)' : ''}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Varış Limanı</Label>
                                <Select
                                    value={editRouteForm.data.arrivalPort}
                                    onValueChange={(val) => {
                                        editRouteForm.setData((prev) => ({
                                            ...prev,
                                            arrivalPort: val,
                                            departurePort: prev.departurePort === val ? '' : prev.departurePort,
                                        }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ports.map((p) => {
                                            const isSelectedDeparture = p.name === editRouteForm.data.departurePort;
                                            return (
                                                <SelectItem key={p.id} value={p.name} disabled={isSelectedDeparture}>
                                                    {p.name} {p.code ? `(${p.code})` : ''} {isSelectedDeparture ? '⚠️ (Kalkış)' : ''}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label>Tahmini Süre (Saat)</Label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    value={editRouteForm.data.durationHours}
                                    onChange={(e) => editRouteForm.setData('durationHours', parseFloat(e.target.value) || 0)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Mesafe (NM)</Label>
                                <Input
                                    type="number"
                                    value={editRouteForm.data.distanceNm}
                                    onChange={(e) => editRouteForm.setData('distanceNm', parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Durum</Label>
                                <Select
                                    value={editRouteForm.data.status}
                                    onValueChange={(val) => editRouteForm.setData('status', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Aktif">Aktif</SelectItem>
                                        <SelectItem value="Pasif">Pasif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Detaylı Açıklama</Label>
                            <Input
                                value={editRouteForm.data.description}
                                onChange={(e) => editRouteForm.setData('description', e.target.value)}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setEditingRoute(null)}>
                                İptal
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    editRouteForm.processing ||
                                    !editRouteForm.data.departurePort ||
                                    !editRouteForm.data.arrivalPort ||
                                    editRouteForm.data.departurePort === editRouteForm.data.arrivalPort
                                }
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {editRouteForm.processing ? 'Kaydediliyor...' : 'Güncelle'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
