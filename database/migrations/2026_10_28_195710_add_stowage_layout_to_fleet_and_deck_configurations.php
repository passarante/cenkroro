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
        Schema::table('fleet', function (Blueprint $table) {
            $table->text('stowage_layout_json')->nullable()->after('decks_json');
        });

        Schema::table('deck_configurations', function (Blueprint $table) {
            $table->string('vessel_id')->nullable()->after('deckKey');
            $table->string('voyage_id')->nullable()->after('vessel_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fleet', function (Blueprint $table) {
            $table->dropColumn('stowage_layout_json');
        });

        Schema::table('deck_configurations', function (Blueprint $table) {
            $table->dropColumn(['vessel_id', 'voyage_id']);
        });
    }
};
