<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use PDO;

class RoRoDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. FLEET (Gemiler)
        if (DB::table('fleet')->count() === 0) {
            $fleet = [
                [
                    'id' => 'VES-01',
                    'name' => 'M/V EGE STAR',
                    'flag' => 'TR 🇹🇷',
                    'imo' => '9874211',
                    'builtYear' => 2021,
                    'laneMeters' => 3850,
                    'deadweight' => 29500,
                    'speedKnots' => 21.4,
                    'reeferPlugs' => 180,
                    'decks_json' => json_encode(['Weather Deck', 'Upper Deck', 'Main Deck', 'Lower Hold']),
                    'status' => 'Yüklemede (Loading)',
                    'currentPort' => 'Pendik Ro-Ro Terminali',
                    'nextPort' => 'Trieste Port (Molo VII)',
                    'captain' => 'Kpt. Burak Çelik',
                    'cargoLoaded_json' => json_encode(['laneMeters' => 3340, 'tirCount' => 184, 'totalWeightTon' => 5920]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'id' => 'VES-02',
                    'name' => 'M/V MEDITERRANEAN BREEZE',
                    'flag' => 'PA 🇵🇦',
                    'imo' => '9912044',
                    'builtYear' => 2023,
                    'laneMeters' => 4100,
                    'deadweight' => 31200,
                    'speedKnots' => 20.8,
                    'reeferPlugs' => 210,
                    'decks_json' => json_encode(['Weather Deck', 'Upper Deck', 'Main Deck', 'Lower Hold']),
                    'status' => 'Seyirde (Underway)',
                    'currentPort' => "Adriyatik Denizi (39°12'N 18°45'E)",
                    'nextPort' => 'Trieste Port',
                    'captain' => 'Kpt. Selim Yılmaz',
                    'cargoLoaded_json' => json_encode(['laneMeters' => 3820, 'tirCount' => 218, 'totalWeightTon' => 6840]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'id' => 'VES-03',
                    'name' => 'M/V ANATOLIA EXPRESS',
                    'flag' => 'TR 🇹🇷',
                    'imo' => '9765320',
                    'builtYear' => 2019,
                    'laneMeters' => 3600,
                    'deadweight' => 27800,
                    'speedKnots' => 19.5,
                    'reeferPlugs' => 150,
                    'decks_json' => json_encode(['Weather Deck', 'Upper Deck', 'Main Deck', 'Lower Hold']),
                    'status' => 'Rıhtımda (Berthing)',
                    'currentPort' => 'Yalova Ro-Ro Terminali',
                    'nextPort' => 'Sète Port (Fransa)',
                    'captain' => 'Kpt. Murat Keskin',
                    'cargoLoaded_json' => json_encode(['laneMeters' => 1420, 'tirCount' => 78, 'totalWeightTon' => 2450]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'id' => 'VES-04',
                    'name' => 'M/V TROY SEAWAYS',
                    'flag' => 'TR 🇹🇷',
                    'imo' => '9945182',
                    'builtYear' => 2024,
                    'laneMeters' => 4200,
                    'deadweight' => 32500,
                    'speedKnots' => 22.0,
                    'reeferPlugs' => 230,
                    'decks_json' => json_encode(['Weather Deck', 'Upper Deck', 'Main Deck', 'Lower Hold']),
                    'status' => 'Seyirde (Underway)',
                    'currentPort' => "İyon Denizi (37°45'N 20°15'E)",
                    'nextPort' => 'Taranto Port (İtalya)',
                    'captain' => 'Kpt. Emre Taşkın',
                    'cargoLoaded_json' => json_encode(['laneMeters' => 3950, 'tirCount' => 232, 'totalWeightTon' => 7210]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ];
            DB::table('fleet')->insert($fleet);
            $this->command->info('Seeded 4 vessels into fleet.');
        }

        // 2. PORTS (Limanlar)
        if (DB::table('ports')->count() === 0) {
            $ports = [
                ['id' => 'PORT-01', 'name' => 'Pendik Ro-Ro Terminali (İstanbul)', 'code' => 'TRPDK', 'country' => 'Türkiye', 'city' => 'İstanbul', 'berth' => 'Rıhtım 1, 2', 'type' => 'Kalkış', 'hasCustoms' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'PORT-02', 'name' => 'Çeşme Ulusoy Terminali (İzmir)', 'code' => 'TRCES', 'country' => 'Türkiye', 'city' => 'İzmir', 'berth' => 'Rıhtım 1', 'type' => 'Kalkış', 'hasCustoms' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'PORT-03', 'name' => 'Yalova Ro-Ro Terminali', 'code' => 'TRYAL', 'country' => 'Türkiye', 'city' => 'Yalova', 'berth' => 'Rıhtım 1, 2', 'type' => 'Kalkış', 'hasCustoms' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'PORT-04', 'name' => 'Mersin Uluslararası Limanı', 'code' => 'TRMER', 'country' => 'Türkiye', 'city' => 'Mersin', 'berth' => 'Rıhtım 3', 'type' => 'Kalkış', 'hasCustoms' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'PORT-05', 'name' => 'Trieste Port (Molo VII), İtalya', 'code' => 'ITTRS', 'country' => 'İtalya', 'city' => 'Trieste', 'berth' => 'Molo VII / Pier 7', 'type' => 'Varış', 'hasCustoms' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'PORT-06', 'name' => 'Sète Port, Fransa', 'code' => 'FRSET', 'country' => 'Fransa', 'city' => 'Sète', 'berth' => 'Quai H', 'type' => 'Varış', 'hasCustoms' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'PORT-07', 'name' => 'Taranto Port, İtalya', 'code' => 'ITTAR', 'country' => 'İtalya', 'city' => 'Taranto', 'berth' => 'Molo San Cataldo', 'type' => 'Varış', 'hasCustoms' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'PORT-08', 'name' => 'Patras Limanı, Yunanistan', 'code' => 'GRGPA', 'country' => 'Yunanistan', 'city' => 'Patras', 'berth' => 'Güney Limanı', 'type' => 'Varış', 'hasCustoms' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'PORT-09', 'name' => 'Koper Port, Slovenya', 'code' => 'SIKOP', 'country' => 'Slovenya', 'city' => 'Koper', 'berth' => 'Pier 2 Ro-Ro', 'type' => 'Varış', 'hasCustoms' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'PORT-10', 'name' => 'Toulon Port, Fransa', 'code' => 'FRTLN', 'country' => 'Fransa', 'city' => 'Toulon', 'berth' => 'Brégaillon Terminal', 'type' => 'Varış', 'hasCustoms' => 1, 'created_at' => now(), 'updated_at' => now()],
            ];
            DB::table('ports')->insert($ports);
            $this->command->info('Seeded 10 ports.');
        }

        // 3. CATEGORIES
        if (DB::table('categories')->count() === 0) {
            $categories = [
                ['id' => 'CAT-01', 'name' => 'Komple TIR', 'desc' => 'Çekici + Yarı Römork / Dorse (16.50m)', 'icon' => '🚚', 'defaultLengthM' => 16.5, 'defaultMaxWeightTon' => 40.0, 'isReeferCapable' => 0, 'isAdrCapable' => 0, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'CAT-02', 'name' => 'Yalnız Dorse', 'desc' => 'Çekicisiz Yarı Römork / Unaccompanied Trailer (13.60m)', 'icon' => '🚛', 'defaultLengthM' => 13.6, 'defaultMaxWeightTon' => 34.0, 'isReeferCapable' => 0, 'isAdrCapable' => 0, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'CAT-03', 'name' => 'Frigo TIR', 'desc' => 'Soğutuculu Komple Frigo Araç (Sürekli Elektrik Bağlantılı)', 'icon' => '❄️', 'defaultLengthM' => 16.5, 'defaultMaxWeightTon' => 40.0, 'isReeferCapable' => 1, 'isAdrCapable' => 0, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'CAT-04', 'name' => 'ADR / Kimyasal Tanker', 'desc' => 'IMDG / ADR Sınıfı Tehlikeli Madde Taşıyan Tanker veya Dorse', 'icon' => '☣️', 'defaultLengthM' => 16.5, 'defaultMaxWeightTon' => 40.0, 'isReeferCapable' => 0, 'isAdrCapable' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'CAT-05', 'name' => 'Proje / Gabari Dışı', 'desc' => 'Ağır İş Makinesi, Lowbed veya Gabari Dışı Proje Yükü', 'icon' => '🚜', 'defaultLengthM' => 21.0, 'defaultMaxWeightTon' => 65.0, 'isReeferCapable' => 0, 'isAdrCapable' => 0, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'CAT-06', 'name' => 'Otomobil & Hafif Ticari', 'desc' => 'Binek Araç, SUV, Minivan veya Sıfır Kilometre Filo', 'icon' => '🚗', 'defaultLengthM' => 5.5, 'defaultMaxWeightTon' => 3.5, 'isReeferCapable' => 0, 'isAdrCapable' => 0, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'CAT-07', 'name' => 'Konteyner Şasi / Swap Body', 'desc' => "20' / 40' / 45' Konteyner Taşıyıcı Şasi veya Değişebilir Kasa", 'icon' => '📦', 'defaultLengthM' => 14.5, 'defaultMaxWeightTon' => 36.0, 'isReeferCapable' => 0, 'isAdrCapable' => 0, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'CAT-08', 'name' => 'Kamyon / Kamyonet', 'desc' => 'Solo Kamyon veya Kamyonet (12.0m altı)', 'icon' => '🚐', 'defaultLengthM' => 10.0, 'defaultMaxWeightTon' => 18.0, 'isReeferCapable' => 0, 'isAdrCapable' => 0, 'created_at' => now(), 'updated_at' => now()],
            ];
            DB::table('categories')->insert($categories);
            $this->command->info('Seeded 8 categories.');
        }

        // 4. GATE LOGS
        if (DB::table('gate_logs')->count() === 0) {
            $gateLogs = [
                ['id' => 'GL-9821', 'time' => '14:22:10', 'plate' => '34 GCU 514', 'type' => 'Komple TIR', 'gateNumber' => 'KAPI-1 (Ana Giriş)', 'declaredWeight' => 36.0, 'kantarWeight' => 36.15, 'variance' => '+0.15 ton', 'status' => 'Onaylandı (Geçti)', 'driver' => 'Hakan Sarıçayır', 'sealNumber' => 'SL-99412A', 'created_at' => now(), 'updated_at' => now()],
                ['id' => 'GL-9820', 'time' => '13:50:04', 'plate' => '34 BRS 104', 'type' => 'ADR Tanker', 'gateNumber' => 'KAPI-2 (ADR Kapısı)', 'declaredWeight' => 36.8, 'kantarWeight' => 36.75, 'variance' => '-0.05 ton', 'status' => 'Onaylandı (Geçti)', 'driver' => 'Kemal Yücel', 'sealNumber' => 'SL-88120B', 'created_at' => now(), 'updated_at' => now()],
            ];
            DB::table('gate_logs')->insert($gateLogs);
            $this->command->info('Seeded 2 gate logs.');
        }

        // 5. Transfer existing SQLite dynamic records (voyages, bookings, forwarders, tariffs, deck_configurations)
        $sourcePath = 'C:\\Users\\hakans\\.gemini\\antigravity-ide\\scratch\\Roro_Platform\\server\\roro_platform.db';
        if (! file_exists($sourcePath)) {
            $sourcePath = database_path('database.sqlite');
        }

        if (file_exists($sourcePath) && $sourcePath !== config('database.connections.sqlite.database')) {
            $pdo = new PDO("sqlite:{$sourcePath}");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $dynamicTables = ['voyages', 'forwarders', 'tariffs', 'bookings', 'deck_configurations'];

            foreach ($dynamicTables as $table) {
                try {
                    $stmt = $pdo->query("SELECT * FROM {$table}");
                    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    if (count($rows) > 0) {
                        DB::table($table)->truncate();
                        $targetColumns = Schema::getColumnListing($table);

                        foreach ($rows as $row) {
                            $cleanRow = [];
                            foreach ($row as $col => $val) {
                                if (in_array($col, $targetColumns)) {
                                    $cleanRow[$col] = $val;
                                } elseif ($col === 'createdAt' && in_array('created_at', $targetColumns)) {
                                    $cleanRow['created_at'] = $val;
                                } elseif ($col === 'updatedAt' && in_array('updated_at', $targetColumns)) {
                                    $cleanRow['updated_at'] = $val;
                                }
                            }
                            if (! isset($cleanRow['created_at']) || strtotime((string) $cleanRow['created_at']) === false) {
                                $cleanRow['created_at'] = now();
                            }
                            if (! isset($cleanRow['updated_at']) || strtotime((string) $cleanRow['updated_at']) === false) {
                                $cleanRow['updated_at'] = now();
                            }

                            DB::table($table)->insert($cleanRow);
                        }
                        $this->command->info('Transferred '.count($rows)." rows for table: {$table}");
                    }
                } catch (\Throwable $e) {
                    $this->command->warn("Error transferring {$table}: ".$e->getMessage());
                }
            }
        }
    }
}
