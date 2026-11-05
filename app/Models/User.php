<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const MODULES = [
        'dashboard' => 'Operasyon Masası (Genel Bakış)',
        'voyages' => 'Seferler & Filo Yönetimi',
        'bookings' => 'Rezervasyon Masası',
        'stowage' => 'İstif Planı (Güverte)',
        'customs' => 'Gümrük & Manifesto',
        'gate' => 'Kapı & Kantar Girişi',
        'forwarders' => 'Acenteler & Cari Risk',
        'tariffs' => 'Tarifeler & Fiyatlar',
        'portal' => 'Acente & Sürücü Portalı',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'permissions_json',
        'otp_code',
        'otp_expires_at',
        'phone',
        'company_name',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'otp_code',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'otp_expires_at' => 'datetime',
            'permissions_json' => 'array',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return ($this->role ?? 'operation') === 'admin';
    }

    public function isOperation(): bool
    {
        return ($this->role ?? 'operation') === 'operation';
    }

    public function isField(): bool
    {
        return ($this->role ?? 'operation') === 'field';
    }

    public function isActive(): bool
    {
        return ($this->status ?? 'active') === 'active';
    }

    public function hasPermission(string $module): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        if ($this->isField()) {
            return $module === 'portal';
        }

        if ($this->isOperation()) {
            $perms = $this->permissions_json ?? [];

            // If empty array or not configured, default allow basic modules or perms
            if (empty($perms)) {
                return in_array($module, ['dashboard', 'voyages', 'bookings', 'portal']);
            }

            return in_array($module, $perms, true);
        }

        return false;
    }
}
