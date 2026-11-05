<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('voyage_routes', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('departurePort');
            $table->string('arrivalPort');
            $table->double('durationHours')->default(60.0);
            $table->integer('distanceNm')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('Aktif');
            $table->timestamps();
        });

        // Seed initial standard routes
        $defaultRoutes = [
            [
                'id' => 'ROT-01',
                'name' => 'Pendik ➔ Trieste Ekspres Hattı',
                'code' => 'PDK-TRS',
                'departurePort' => 'Pendik Ro-Ro Terminali (İstanbul)',
                'arrivalPort' => 'Trieste Port (Molo VII), İtalya',
                'durationHours' => 60.0,
                'distanceNm' => 1180,
                'description' => 'Adriyatik ana ihracat hattı. Haftalık düzenli seferler.',
                'status' => 'Aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'ROT-02',
                'name' => 'Trieste ➔ Pendik Dönüş Hattı',
                'code' => 'TRS-PDK',
                'departurePort' => 'Trieste Port (Molo VII), İtalya',
                'arrivalPort' => 'Pendik Ro-Ro Terminali (İstanbul)',
                'durationHours' => 60.0,
                'distanceNm' => 1180,
                'description' => 'Avrupa ithalat ve dönüş araçları ana güzergahı.',
                'status' => 'Aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'ROT-03',
                'name' => 'Yalova ➔ Sète Fransa Hattı',
                'code' => 'YAL-SET',
                'departurePort' => 'Yalova Ro-Ro Terminali',
                'arrivalPort' => 'Sète Port, Fransa',
                'durationHours' => 72.0,
                'distanceNm' => 1450,
                'description' => 'Batı Akdeniz / İspanya & Fransa direkt karayolu bağlantısı.',
                'status' => 'Aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'ROT-04',
                'name' => 'Sète ➔ Yalova Dönüş Hattı',
                'code' => 'SET-YAL',
                'departurePort' => 'Sète Port, Fransa',
                'arrivalPort' => 'Yalova Ro-Ro Terminali',
                'durationHours' => 72.0,
                'distanceNm' => 1450,
                'description' => 'Fransa\'dan Marmara bölgesine ithalat yükü taşıma hattı.',
                'status' => 'Aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'ROT-05',
                'name' => 'Çeşme ➔ Patras Ege Hattı',
                'code' => 'CES-PAT',
                'departurePort' => 'Çeşme Ulusoy Terminali (İzmir)',
                'arrivalPort' => 'Patras Limanı, Yunanistan',
                'durationHours' => 24.0,
                'distanceNm' => 420,
                'description' => 'Ege ekspres koridoru, hızlı TIR geçiş hattı.',
                'status' => 'Aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'ROT-06',
                'name' => 'Mersin ➔ Trieste Akdeniz Hattı',
                'code' => 'MER-TRS',
                'departurePort' => 'Mersin Uluslararası Limanı',
                'arrivalPort' => 'Trieste Port (Molo VII), İtalya',
                'durationHours' => 84.0,
                'distanceNm' => 1620,
                'description' => 'Güney Anadolu, Çukurova ve Ortadoğu transit koridoru.',
                'status' => 'Aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('voyage_routes')->insert($defaultRoutes);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voyage_routes');
    }
};
