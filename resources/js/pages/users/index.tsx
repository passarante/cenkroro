import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData, User } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Edit2,
    KeyRound,
    Plus,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Smartphone,
    Trash2,
    UserCheck,
    UserMinus,
    Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface UsersPageProps {
    users: Array<
        User & {
            permissions_json: string[];
            created_at?: string;
        }
    >;
    modules: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kullanıcı & Yetki Yönetimi', href: '/users' },
];

export default function UsersIndex({ users = [], modules = {} }: UsersPageProps) {
    const { auth } = usePage<SharedData>().props;
    const currentUserId = auth.user?.id;

    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);

    // Create User Form
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'operation',
        status: 'active',
        phone: '',
        company_name: '',
        permissions_json: ['dashboard', 'voyages', 'bookings', 'gate', 'portal'] as string[],
    });

    // Edit User Form
    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'operation',
        status: 'active',
        phone: '',
        company_name: '',
        permissions_json: [] as string[],
    });

    const openEditModal = (u: any) => {
        setEditingUser(u);
        editForm.setData({
            name: u.name,
            email: u.email,
            password: '',
            role: u.role || 'operation',
            status: u.status || 'active',
            phone: u.phone || '',
            company_name: u.company_name || '',
            permissions_json: Array.isArray(u.permissions_json) ? u.permissions_json : [],
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('users.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
                toast.success('Yeni kullanıcı başarıyla eklendi.');
            },
            onError: (errs) => {
                toast.error(Object.values(errs)[0] || 'Kullanıcı eklenirken bir hata oluştu.');
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        editForm.post(route('users.update', editingUser.id), {
            onSuccess: () => {
                setEditingUser(null);
                toast.success('Kullanıcı bilgileri ve yetkileri güncellendi.');
            },
            onError: (errs) => {
                toast.error(Object.values(errs)[0] || 'Güncelleme sırasında bir hata oluştu.');
            },
        });
    };

    const handleToggleStatus = (u: any) => {
        if (u.id === currentUserId) {
            toast.error('Kendi hesabınızı pasife alamazsınız.');
            return;
        }

        const actionText = u.status === 'active' ? 'pasife almak' : 'aktifleştirmek';
        if (confirm(`${u.name} kullanıcısını ${actionText} istediğinize emin misiniz?`)) {
            router.post(route('users.toggle_status', u.id), {}, {
                onSuccess: () => toast.success('Kullanıcı durumu güncellendi.'),
                onError: (errs) => toast.error(Object.values(errs)[0] || 'İşlem başarısız.'),
            });
        }
    };

    const handleDeleteUser = (u: any) => {
        if (u.id === currentUserId) {
            toast.error('Kendi hesabınızı silemezsiniz.');
            return;
        }

        if (confirm(`"${u.name}" (${u.email}) kullanıcısını sistemden kalıcı olarak silmek istiyor musunuz?`)) {
            router.post(route('users.destroy', u.id), {}, {
                onSuccess: () => toast.success('Kullanıcı silindi.'),
                onError: (errs) => toast.error(Object.values(errs)[0] || 'Silme işlemi başarısız.'),
            });
        }
    };

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesSearch =
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u.company_name && u.company_name.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
            const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, roleFilter, statusFilter]);

    // Statistics
    const stats = useMemo(() => {
        return {
            total: users.length,
            adminCount: users.filter((u) => u.role === 'admin').length,
            operationCount: users.filter((u) => u.role === 'operation').length,
            fieldCount: users.filter((u) => u.role === 'field').length,
            inactiveCount: users.filter((u) => u.status === 'inactive').length,
        };
    }, [users]);

    const moduleKeys = Object.keys(modules);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kullanıcı & Yetki Yönetimi" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Shield className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight">Kullanıcı & Yetki Yönetimi</h1>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Yönetici, operasyon ekibi ve saha şoförlerinin modül erişimlerini ve hesap durumlarını yönetin.
                        </p>
                    </div>

                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-sm">
                        <Plus className="h-4 w-4" />
                        Yeni Kullanıcı Ekle
                    </Button>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <Card className="border-border/60">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Toplam Kullanıcı</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-[11px] text-muted-foreground">Sistemde kayıtlı hesap</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-blue-50/20 dark:bg-blue-950/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-300">Yöneticiler</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.adminCount}</div>
                            <p className="text-[11px] text-muted-foreground">Tam modül & kullanıcı yetkisi</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-emerald-50/20 dark:bg-emerald-950/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Operasyon</CardTitle>
                            <UserCheck className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.operationCount}</div>
                            <p className="text-[11px] text-muted-foreground">Grup yetkisiyle sınırlı</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-amber-50/20 dark:bg-amber-950/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-amber-700 dark:text-amber-300">Saha (OTP)</CardTitle>
                            <Smartphone className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.fieldCount}</div>
                            <p className="text-[11px] text-muted-foreground">E-posta kodu ile rezervasyon</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-red-50/20 dark:bg-red-950/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-red-700 dark:text-red-300">Pasif Hesaplar</CardTitle>
                            <UserMinus className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.inactiveCount}</div>
                            <p className="text-[11px] text-muted-foreground">Girişi durdurulan kullanıcılar</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card p-3 rounded-lg border">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="İsim, e-posta veya firma ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>Rol:</span>
                            <select
                                className="h-9 text-xs rounded-md border border-input bg-background px-2.5 py-1"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="ALL">Tüm Roller</option>
                                <option value="admin">Yönetici (Admin)</option>
                                <option value="operation">Operasyon</option>
                                <option value="field">Saha Kullanıcısı</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>Durum:</span>
                            <select
                                className="h-9 text-xs rounded-md border border-input bg-background px-2.5 py-1"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">Tüm Durumlar</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Pasif</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <Card className="border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase border-b">
                                <tr>
                                    <th className="px-4 py-3">Kullanıcı Bilgisi</th>
                                    <th className="px-4 py-3">Rol & Tip</th>
                                    <th className="px-4 py-3">Firma / İletişim</th>
                                    <th className="px-4 py-3">Yetkili Modüller</th>
                                    <th className="px-4 py-3">Durum</th>
                                    <th className="px-4 py-3 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                            Kriterlere uygun kullanıcı bulunamadı.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u) => {
                                        const isSelf = u.id === currentUserId;
                                        return (
                                            <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                                                {/* Kullanıcı Adı & Mail */}
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-foreground flex items-center gap-2">
                                                        {u.name}
                                                        {isSelf && (
                                                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-normal">
                                                                Sen
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{u.email}</div>
                                                </td>

                                                {/* Rol */}
                                                <td className="px-4 py-3">
                                                    {u.role === 'admin' && (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
                                                            <ShieldCheck className="h-3 w-3 mr-1" />
                                                            Yönetici
                                                        </Badge>
                                                    )}
                                                    {u.role === 'operation' && (
                                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                            <UserCheck className="h-3 w-3 mr-1" />
                                                            Operasyon
                                                        </Badge>
                                                    )}
                                                    {u.role === 'field' && (
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
                                                            <Smartphone className="h-3 w-3 mr-1" />
                                                            Saha (OTP)
                                                        </Badge>
                                                    )}
                                                </td>

                                                {/* Firma & Telefon */}
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-xs text-foreground">
                                                        {u.company_name || '—'}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">{u.phone || '—'}</div>
                                                </td>

                                                {/* Yetkili Modüller */}
                                                <td className="px-4 py-3">
                                                    {u.role === 'admin' ? (
                                                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                                            Tüm Modüller & Raporlar (Tam Yetki)
                                                        </span>
                                                    ) : u.role === 'field' ? (
                                                        <span className="text-xs text-amber-600 dark:text-amber-400">
                                                            Sadece Rezervasyon & Sefer Takibi
                                                        </span>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                                            {(u.permissions_json || []).map((slug: string) => (
                                                                <span
                                                                    key={slug}
                                                                    className="inline-block text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
                                                                >
                                                                    {modules[slug] || slug}
                                                                </span>
                                                            ))}
                                                            {(!u.permissions_json || u.permissions_json.length === 0) && (
                                                                <span className="text-xs text-muted-foreground italic">
                                                                    Varsayılan Temel Yetkiler
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Durum */}
                                                <td className="px-4 py-3">
                                                    {u.status === 'active' ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                            Pasif
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Aksiyonlar */}
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 text-xs"
                                                            onClick={() => openEditModal(u)}
                                                        >
                                                            <Edit2 className="h-3.5 w-3.5 mr-1" />
                                                            Düzenle
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant={u.status === 'active' ? 'secondary' : 'default'}
                                                            className={`h-8 text-xs ${
                                                                u.status === 'active'
                                                                    ? 'text-amber-700 hover:text-amber-800'
                                                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                            }`}
                                                            disabled={isSelf}
                                                            onClick={() => handleToggleStatus(u)}
                                                            title={isSelf ? 'Kendi hesabınızı pasife alamazsınız' : ''}
                                                        >
                                                            {u.status === 'active' ? 'Pasife Al' : 'Aktifleştir'}
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                                                            disabled={isSelf}
                                                            onClick={() => handleDeleteUser(u)}
                                                            title={isSelf ? 'Kendi hesabınızı silemezsiniz' : 'Kullanıcıyı Sil'}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* CREATE USER DIALOG */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" />
                            Yeni Kullanıcı Ekle
                        </DialogTitle>
                        <DialogDescription>
                            Sisteme yeni bir yönetici, operasyon yetkilisi veya saha kullanıcısı tanımlayın.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="c_name">Ad Soyad *</Label>
                                <Input
                                    id="c_name"
                                    required
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="Örn: Ahmet Yılmaz"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="c_email">E-posta Adresi *</Label>
                                <Input
                                    id="c_email"
                                    type="email"
                                    required
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    placeholder="ahmet@cenkroro.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="c_role">Kullanıcı Rolü *</Label>
                                <select
                                    id="c_role"
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                    value={createForm.data.role}
                                    onChange={(e) => createForm.setData('role', e.target.value)}
                                >
                                    <option value="operation">Operasyon Kullanıcısı (Yetki Gruplu)</option>
                                    <option value="admin">Yönetici (Tüm Modüllere Erişim & Kullanıcı Yönetimi)</option>
                                    <option value="field">Saha Kullanıcısı (OTP Girişi, Rezervasyon & Sefer Takibi)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="c_status">Hesap Durumu *</Label>
                                <select
                                    id="c_status"
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                    value={createForm.data.status}
                                    onChange={(e) => createForm.setData('status', e.target.value)}
                                >
                                    <option value="active">Aktif (Giriş Yapabilir)</option>
                                    <option value="inactive">Pasif (Giriş Engellensin)</option>
                                </select>
                            </div>
                        </div>

                        {createForm.data.role !== 'field' ? (
                            <div className="space-y-1.5">
                                <Label htmlFor="c_password">Giriş Şifresi *</Label>
                                <Input
                                    id="c_password"
                                    type="password"
                                    required
                                    value={createForm.data.password}
                                    onChange={(e) => createForm.setData('password', e.target.value)}
                                    placeholder="En az 6 karakter"
                                />
                            </div>
                        ) : (
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md text-xs text-amber-800 dark:text-amber-300">
                                💡 <strong>Saha Kullanıcısı Bilgisi:</strong> Saha şoförleri ve acenteler sisteme e-posta adreslerine gönderilen 6 haneli tek kullanımlık şifre (OTP) ile giriş yaparlar. Şifre zorunlu değildir.
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="c_company">Firma Adı (Opsiyonel)</Label>
                                <Input
                                    id="c_company"
                                    value={createForm.data.company_name}
                                    onChange={(e) => createForm.setData('company_name', e.target.value)}
                                    placeholder="Örn: Kuzey Lojistik Ltd."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="c_phone">Telefon Numarası (Opsiyonel)</Label>
                                <Input
                                    id="c_phone"
                                    value={createForm.data.phone}
                                    onChange={(e) => createForm.setData('phone', e.target.value)}
                                    placeholder="+90 532 ..."
                                />
                            </div>
                        </div>

                        {/* Operasyon Modül Yetkileri Seçimi */}
                        {createForm.data.role === 'operation' && (
                            <div className="space-y-2 pt-2 border-t">
                                <div className="flex items-center justify-between">
                                    <Label className="font-semibold text-sm">Operasyon Modül Yetkileri</Label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            className="text-xs text-primary underline"
                                            onClick={() => createForm.setData('permissions_json', moduleKeys)}
                                        >
                                            Tümünü Seç
                                        </button>
                                        <button
                                            type="button"
                                            className="text-xs text-muted-foreground underline"
                                            onClick={() => createForm.setData('permissions_json', [])}
                                        >
                                            Temizle
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg border">
                                    {moduleKeys.map((slug) => {
                                        const checked = createForm.data.permissions_json.includes(slug);
                                        return (
                                            <label
                                                key={slug}
                                                className="flex items-center gap-2 text-xs cursor-pointer p-1.5 rounded hover:bg-muted/60"
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(val) => {
                                                        const current = [...createForm.data.permissions_json];
                                                        if (val) {
                                                            createForm.setData('permissions_json', [...current, slug]);
                                                        } else {
                                                            createForm.setData(
                                                                'permissions_json',
                                                                current.filter((s) => s !== slug)
                                                            );
                                                        }
                                                    }}
                                                />
                                                <span className="font-medium text-foreground">{modules[slug]}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                Kullanıcıyı Kaydet
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* EDIT USER DIALOG */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit2 className="h-5 w-5 text-primary" />
                            Kullanıcı ve Yetkileri Düzenle
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser?.name} ({editingUser?.email}) için rol, yetki grubu ve durum ayarlarını güncelleyin.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="e_name">Ad Soyad *</Label>
                                <Input
                                    id="e_name"
                                    required
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="e_email">E-posta Adresi *</Label>
                                <Input
                                    id="e_email"
                                    type="email"
                                    required
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="e_role">Kullanıcı Rolü *</Label>
                                <select
                                    id="e_role"
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                    value={editForm.data.role}
                                    onChange={(e) => editForm.setData('role', e.target.value)}
                                >
                                    <option value="operation">Operasyon Kullanıcısı (Yetki Gruplu)</option>
                                    <option value="admin">Yönetici (Tüm Modüllere Erişim & Kullanıcı Yönetimi)</option>
                                    <option value="field">Saha Kullanıcısı (OTP Girişi, Rezervasyon & Sefer Takibi)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="e_status">Hesap Durumu *</Label>
                                <select
                                    id="e_status"
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                    value={editForm.data.status}
                                    onChange={(e) => editForm.setData('status', e.target.value)}
                                >
                                    <option value="active">Aktif (Giriş Yapabilir)</option>
                                    <option value="inactive">Pasif (Giriş Engellensin)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="e_password">Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)</Label>
                            <Input
                                id="e_password"
                                type="password"
                                value={editForm.data.password}
                                onChange={(e) => editForm.setData('password', e.target.value)}
                                placeholder="Mevcut şifreyi korumak için boş bırakın"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="e_company">Firma Adı</Label>
                                <Input
                                    id="e_company"
                                    value={editForm.data.company_name}
                                    onChange={(e) => editForm.setData('company_name', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="e_phone">Telefon Numarası</Label>
                                <Input
                                    id="e_phone"
                                    value={editForm.data.phone}
                                    onChange={(e) => editForm.setData('phone', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Operasyon Modül Yetkileri Seçimi */}
                        {editForm.data.role === 'operation' && (
                            <div className="space-y-2 pt-2 border-t">
                                <div className="flex items-center justify-between">
                                    <Label className="font-semibold text-sm">Operasyon Modül Yetkileri</Label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            className="text-xs text-primary underline"
                                            onClick={() => editForm.setData('permissions_json', moduleKeys)}
                                        >
                                            Tümünü Seç
                                        </button>
                                        <button
                                            type="button"
                                            className="text-xs text-muted-foreground underline"
                                            onClick={() => editForm.setData('permissions_json', [])}
                                        >
                                            Temizle
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg border">
                                    {moduleKeys.map((slug) => {
                                        const checked = editForm.data.permissions_json.includes(slug);
                                        return (
                                            <label
                                                key={slug}
                                                className="flex items-center gap-2 text-xs cursor-pointer p-1.5 rounded hover:bg-muted/60"
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(val) => {
                                                        const current = [...editForm.data.permissions_json];
                                                        if (val) {
                                                            editForm.setData('permissions_json', [...current, slug]);
                                                        } else {
                                                            editForm.setData(
                                                                'permissions_json',
                                                                current.filter((s) => s !== slug)
                                                            );
                                                        }
                                                    }}
                                                />
                                                <span className="font-medium text-foreground">{modules[slug]}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                Güncelle ve Kaydet
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
