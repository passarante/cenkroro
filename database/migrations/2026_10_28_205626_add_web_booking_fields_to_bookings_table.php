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
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('contactName')->nullable()->after('shipper');
            $table->string('contactSurname')->nullable()->after('contactName');
            $table->string('contactMail')->nullable()->after('contactSurname');
            $table->string('contactPhone')->nullable()->after('contactMail');
            $table->string('vehicleKind')->nullable()->after('category');
            $table->string('trailerType')->nullable()->after('vehicleKind');
            $table->boolean('hasElectricity')->default(false)->after('isReefer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'contactName',
                'contactSurname',
                'contactMail',
                'contactPhone',
                'vehicleKind',
                'trailerType',
                'hasElectricity',
            ]);
        });
    }
};
