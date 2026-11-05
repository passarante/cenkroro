<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeckConfiguration extends Model
{
    protected $table = 'deck_configurations';

    protected $primaryKey = 'deckKey';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected $casts = [
        'config_json' => 'array',
    ];

    public function vessel()
    {
        return $this->belongsTo(Vessel::class, 'vessel_id', 'id');
    }

    public static function getForVesselAndDeck(string $vesselId, string $deckKey): ?self
    {
        $compositeKey = "{$vesselId}_{$deckKey}";
        $config = static::find($compositeKey);
        if (! $config) {
            // Fallback for initial seeded data on VES-01
            if ($vesselId === 'VES-01') {
                $config = static::find($deckKey);
            }
        }

        return $config;
    }
}
