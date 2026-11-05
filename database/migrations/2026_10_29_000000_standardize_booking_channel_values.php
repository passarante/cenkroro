<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Standartlaştır: Web kökenliler 'Web', diğerleri 'Platform'
        DB::table('bookings')
            ->where('bookingChannel', 'like', '%Web%')
            ->orWhereNotNull('contactName')
            ->update(['bookingChannel' => 'Web']);

        DB::table('bookings')
            ->where('bookingChannel', '!=', 'Web')
            ->orWhereNull('bookingChannel')
            ->update(['bookingChannel' => 'Platform']);
    }

    public function down(): void {}
};
