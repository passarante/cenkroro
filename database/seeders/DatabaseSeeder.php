<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Yönetici Kullanıcı (Admin)
        User::firstOrCreate(
            ['email' => 'admin@cenkroro.com'],
            [
                'name' => 'Sistem Yöneticisi',
                'password' => 'password',
                'role' => 'admin',
                'status' => 'active',
                'permissions_json' => array_keys(User::MODULES),
            ]
        );

        // 2. Operasyon Kullanıcısı (Operation)
        User::firstOrCreate(
            ['email' => 'operasyon@cenkroro.com'],
            [
                'name' => 'Operasyon Yetkilisi',
                'password' => 'password',
                'role' => 'operation',
                'status' => 'active',
                'permissions_json' => ['dashboard', 'voyages', 'bookings', 'stowage', 'gate', 'portal'],
            ]
        );

        // 3. Saha Kullanıcısı (Field - OTP ile giriş)
        User::firstOrCreate(
            ['email' => 'saha@lojistik.com'],
            [
                'name' => 'Ahmet Demir (Saha)',
                'password' => null,
                'role' => 'field',
                'status' => 'active',
                'phone' => '+90 532 555 44 33',
                'company_name' => 'Demir Uluslararası Taşımacılık',
            ]
        );
    }
}
