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
        // 1. FLEET (Gemiler)
        Schema::create('fleet', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('flag')->nullable();
            $table->string('imo')->nullable();
            $table->integer('builtYear')->nullable();
            $table->integer('laneMeters')->default(0);
            $table->integer('deadweight')->nullable();
            $table->double('speedKnots')->default(18.0);
            $table->integer('reeferPlugs')->default(0);
            $table->text('decks_json')->nullable();
            $table->string('status')->default('Limanda');
            $table->string('currentPort')->nullable();
            $table->string('nextPort')->nullable();
            $table->string('captain')->nullable();
            $table->text('cargoLoaded_json')->nullable();
            $table->string('updatedAt')->nullable();
            $table->timestamps();
        });

        // 2. PORTS (Limanlar)
        Schema::create('ports', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('country')->nullable();
            $table->string('city')->nullable();
            $table->string('berth')->nullable();
            $table->string('type')->default('Kalkış');
            $table->boolean('hasCustoms')->default(true);
            $table->timestamps();
        });

        // 3. VOYAGES (Seferler)
        Schema::create('voyages', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('vesselId')->nullable();
            $table->string('vesselName')->nullable();
            $table->string('route')->nullable();
            $table->string('departurePort')->nullable();
            $table->string('arrivalPort')->nullable();
            $table->string('departureTime')->nullable();
            $table->string('estimatedArrival')->nullable();
            $table->double('durationHours')->default(60.0);
            $table->string('status')->default('Planlandı (Scheduled)');
            $table->integer('totalCapacityLM')->default(3850);
            $table->integer('bookedLM')->default(0);
            $table->integer('bookedVehicles')->default(0);
            $table->string('berth')->nullable();
            $table->string('agent')->nullable();
            $table->string('weatherCondition')->nullable();
            $table->string('updatedAt')->nullable();
            $table->timestamps();
        });

        // 4. FORWARDERS (Acenteler & Cariler)
        Schema::create('forwarders', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('code')->nullable();
            $table->string('name');
            $table->string('country')->nullable();
            $table->string('city')->nullable();
            $table->string('taxOffice')->nullable();
            $table->string('taxNumber')->nullable();
            $table->string('eoriNumber')->nullable();
            $table->integer('activeBookings')->default(0);
            $table->double('creditLimitEur')->default(0.0);
            $table->double('currentBalanceEur')->default(0.0);
            $table->string('rating')->default('A+');
            $table->string('contactPerson')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->integer('paymentTermDays')->default(30);
            $table->double('discountPercent')->default(0.0);
            $table->integer('allocatedLM')->default(0);
            $table->boolean('hasFrigoAgreement')->default(false);
            $table->boolean('hasAdrAgreement')->default(false);
            $table->string('status')->default('Aktif');
            $table->string('updatedAt')->nullable();
            $table->timestamps();
        });

        // 5. CATEGORIES (Araç Tipleri)
        Schema::create('categories', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->text('desc')->nullable();
            $table->string('icon')->nullable();
            $table->double('defaultLengthM')->default(16.5);
            $table->double('defaultMaxWeightTon')->default(40.0);
            $table->boolean('isReeferCapable')->default(false);
            $table->boolean('isAdrCapable')->default(false);
            $table->timestamps();
        });

        // 6. TARIFFS (Fiyat Listesi)
        Schema::create('tariffs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('category');
            $table->string('categoryDescription')->nullable();
            $table->string('route')->nullable();
            $table->string('currency')->default('EUR');
            $table->double('basePriceUsd')->default(0.0);
            $table->string('validFrom')->nullable();
            $table->string('validTo')->nullable();
            $table->string('status')->default('Aktif');
            $table->double('reeferSurchargeUsd')->default(0.0);
            $table->double('adrSurchargeUsd')->default(0.0);
            $table->double('ispsSecurityFeeUsd')->default(0.0);
            $table->double('bafFuelSurchargeUsd')->default(0.0);
            $table->double('maxGrossWeightTon')->default(44.0);
            $table->double('maxLengthMeters')->default(16.5);
            $table->boolean('includesLashing')->default(true);
            $table->boolean('includesWeighing')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 7. BOOKINGS (Rezervasyonlar & Biniş Kayıtları)
        Schema::create('bookings', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('voyageId')->nullable();
            $table->string('shipper');
            $table->string('truckPlate');
            $table->string('trailerPlate')->nullable();
            $table->string('driverName')->nullable();
            $table->string('driverId')->nullable();
            $table->string('driverPhone')->nullable();
            $table->string('category')->default('Komple TIR');
            $table->double('lengthMeters')->default(16.5);
            $table->double('widthMeters')->default(2.55);
            $table->double('heightMeters')->default(4.0);
            $table->double('weightTon')->default(36.0);
            $table->text('cargoDescription')->nullable();
            $table->string('cargoType')->default('Genel Kargo');
            $table->boolean('isReefer')->default(false);
            $table->double('reeferTemp')->nullable();
            $table->string('reeferPlugNumber')->nullable();
            $table->boolean('isAdr')->default(false);
            $table->string('adrClass')->nullable();
            $table->string('unNumber')->nullable();
            $table->string('status')->default('Rezervasyon Açıldı');
            $table->string('boardingStatus')->default('WAITING_APPROVAL');
            $table->string('paymentStatus')->default('PAID');
            $table->string('paymentMethod')->default('Cari Hesap (Açık)');
            $table->double('paymentAmountEur')->default(1450.0);
            $table->string('bookingChannel')->default('Web Portal');
            $table->string('qrCodeStatus')->default('PENDING');
            $table->text('riskInfo_json')->nullable();
            $table->text('documents_json')->nullable();
            $table->text('failedBoardingDetails_json')->nullable();
            $table->text('riskApproval_json')->nullable();
            $table->string('deck')->nullable();
            $table->integer('lane')->nullable();
            $table->integer('slot')->nullable();
            $table->string('gateInTime')->nullable();
            $table->double('kantarWeightTon')->nullable();
            $table->string('customsStatus')->default('Beklemede (YNS)');
            $table->string('mrnNumber')->nullable();
            $table->timestamps();
        });

        // 8. DECK CONFIGURATIONS (2D Stif Planı)
        Schema::create('deck_configurations', function (Blueprint $table) {
            $table->string('deckKey')->primary();
            $table->text('config_json');
            $table->timestamps();
        });

        // 9. GATE LOGS (Kapı ve Kantar Kayıtları)
        Schema::create('gate_logs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('time')->nullable();
            $table->string('plate')->nullable();
            $table->string('type')->nullable();
            $table->string('gateNumber')->nullable();
            $table->double('declaredWeight')->nullable();
            $table->double('kantarWeight')->nullable();
            $table->string('variance')->nullable();
            $table->string('status')->nullable();
            $table->string('driver')->nullable();
            $table->string('sealNumber')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gate_logs');
        Schema::dropIfExists('deck_configurations');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('tariffs');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('forwarders');
        Schema::dropIfExists('voyages');
        Schema::dropIfExists('ports');
        Schema::dropIfExists('fleet');
    }
};
