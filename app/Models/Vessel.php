<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vessel extends Model
{
    protected $table = 'fleet';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected $casts = [
        'decks_json' => 'array',
        'stowage_layout_json' => 'array',
        'cargoLoaded_json' => 'array',
        'speedKnots' => 'float',
        'laneMeters' => 'integer',
        'reeferPlugs' => 'integer',
        'builtYear' => 'integer',
    ];

    public function voyages()
    {
        return $this->hasMany(Voyage::class, 'vesselId', 'id');
    }

    public function getStatusAttribute(?string $value): string
    {
        if ($value && in_array($value, ['Bakımda', 'Tersanede', 'Hizmet Dışı'])) {
            return $value;
        }

        // Gemi bir sefere bağlı mı ve sefer başlatılmış mı (Seyirde)?
        $voyages = $this->relationLoaded('voyages') ? $this->voyages : $this->voyages()->get();

        $activeVoyage = $voyages
            ->where('status', '!=', 'Tamamlandı (Completed)')
            ->sortByDesc('departureTime')
            ->first();

        if (! $activeVoyage) {
            return 'Limanda';
        }

        if (str_contains($activeVoyage->status, 'Seyirde')) {
            return 'Seyirde (Underway)';
        }

        if (str_contains($activeVoyage->status, 'Yükleme')) {
            return 'Limanda (Yüklemede)';
        }

        if (str_contains($activeVoyage->status, 'Tahliye')) {
            return 'Limanda (Tahliyede)';
        }

        if (str_contains($activeVoyage->status, 'Planlandı')) {
            return 'Limanda (Planlandı)';
        }

        return 'Limanda';
    }

    public function getStowageLayoutAttribute()
    {
        $raw = $this->attributes['stowage_layout_json'] ?? null;
        if (! empty($raw)) {
            $decoded = is_array($raw) ? $raw : json_decode($raw, true);
            if (! empty($decoded) && is_array($decoded)) {
                return $decoded;
            }
        }

        return $this->generateDefaultStowageLayout();
    }

    public function generateDefaultStowageLayout(): array
    {
        $lm = (float) ($this->laneMeters ?: 3850);
        $scale = $lm / 3850;

        return [
            'Weather Deck' => [
                'name' => 'Weather Deck (Açık Güverte)',
                'clearHeight' => 5.2,
                'maxWeightTon' => (int) round(1500 * $scale),
                'hasFrigoPlugs' => true,
                'lanes' => [
                    ['laneNo' => 1, 'lengthM' => (int) round(150 * $scale), 'widthM' => 3.0, 'capacityLM' => (int) round(150 * $scale), 'maxTrailers' => (int) max(1, round(9 * $scale))],
                    ['laneNo' => 2, 'lengthM' => (int) round(170 * $scale), 'widthM' => 3.0, 'capacityLM' => (int) round(170 * $scale), 'maxTrailers' => (int) max(1, round(10 * $scale))],
                    ['laneNo' => 3, 'lengthM' => (int) round(170 * $scale), 'widthM' => 3.0, 'capacityLM' => (int) round(170 * $scale), 'maxTrailers' => (int) max(1, round(10 * $scale))],
                    ['laneNo' => 4, 'lengthM' => (int) round(150 * $scale), 'widthM' => 3.0, 'capacityLM' => (int) round(150 * $scale), 'maxTrailers' => (int) max(1, round(9 * $scale))],
                ],
            ],
            'Upper Deck' => [
                'name' => 'Upper Deck (Üst Kapalı Güverte)',
                'clearHeight' => 4.6,
                'maxWeightTon' => (int) round(1000 * $scale),
                'hasFrigoPlugs' => true,
                'lanes' => [
                    ['laneNo' => 1, 'lengthM' => (int) round(130 * $scale), 'widthM' => 2.9, 'capacityLM' => (int) round(130 * $scale), 'maxTrailers' => (int) max(1, round(7 * $scale))],
                    ['laneNo' => 2, 'lengthM' => (int) round(145 * $scale), 'widthM' => 2.9, 'capacityLM' => (int) round(145 * $scale), 'maxTrailers' => (int) max(1, round(8 * $scale))],
                    ['laneNo' => 3, 'lengthM' => (int) round(145 * $scale), 'widthM' => 2.9, 'capacityLM' => (int) round(145 * $scale), 'maxTrailers' => (int) max(1, round(8 * $scale))],
                    ['laneNo' => 4, 'lengthM' => (int) round(130 * $scale), 'widthM' => 2.9, 'capacityLM' => (int) round(130 * $scale), 'maxTrailers' => (int) max(1, round(7 * $scale))],
                ],
            ],
            'Main Deck' => [
                'name' => 'Main Deck (Ana Güverte)',
                'clearHeight' => 4.8,
                'maxWeightTon' => (int) round(1200 * $scale),
                'hasFrigoPlugs' => true,
                'lanes' => [
                    ['laneNo' => 1, 'lengthM' => (int) round(140 * $scale), 'widthM' => 2.9, 'capacityLM' => (int) round(140 * $scale), 'maxTrailers' => (int) max(1, round(8 * $scale))],
                    ['laneNo' => 2, 'lengthM' => (int) round(160 * $scale), 'widthM' => 2.9, 'capacityLM' => (int) round(160 * $scale), 'maxTrailers' => (int) max(1, round(9 * $scale))],
                    ['laneNo' => 3, 'lengthM' => (int) round(170 * $scale), 'widthM' => 2.9, 'capacityLM' => (int) round(170 * $scale), 'maxTrailers' => (int) max(1, round(10 * $scale))],
                    ['laneNo' => 4, 'lengthM' => (int) round(170 * $scale), 'widthM' => 2.9, 'capacityLM' => (int) round(170 * $scale), 'maxTrailers' => (int) max(1, round(10 * $scale))],
                    ['laneNo' => 5, 'lengthM' => (int) round(160 * $scale), 'widthM' => 2.9, 'capacityLM' => (int) round(160 * $scale), 'maxTrailers' => (int) max(1, round(9 * $scale))],
                    ['laneNo' => 6, 'lengthM' => (int) round(140 * $scale), 'widthM' => 2.9, 'capacityLM' => (int) round(140 * $scale), 'maxTrailers' => (int) max(1, round(8 * $scale))],
                ],
            ],
            'Lower Hold' => [
                'name' => 'Lower Hold (Alt Ambar)',
                'clearHeight' => 4.5,
                'maxWeightTon' => (int) round(900 * $scale),
                'hasFrigoPlugs' => false,
                'lanes' => [
                    ['laneNo' => 1, 'lengthM' => (int) round(110 * $scale), 'widthM' => 2.8, 'capacityLM' => (int) round(110 * $scale), 'maxTrailers' => (int) max(1, round(6 * $scale))],
                    ['laneNo' => 2, 'lengthM' => (int) round(125 * $scale), 'widthM' => 2.8, 'capacityLM' => (int) round(125 * $scale), 'maxTrailers' => (int) max(1, round(7 * $scale))],
                    ['laneNo' => 3, 'lengthM' => (int) round(125 * $scale), 'widthM' => 2.8, 'capacityLM' => (int) round(125 * $scale), 'maxTrailers' => (int) max(1, round(7 * $scale))],
                    ['laneNo' => 4, 'lengthM' => (int) round(110 * $scale), 'widthM' => 2.8, 'capacityLM' => (int) round(110 * $scale), 'maxTrailers' => (int) max(1, round(6 * $scale))],
                ],
            ],
        ];
    }

    public function getDecksCountAttribute(): int
    {
        return count($this->stowage_layout);
    }

    public function getLanesCountAttribute(): int
    {
        $count = 0;
        foreach ($this->stowage_layout as $deck) {
            $count += count($deck['lanes'] ?? []);
        }

        return $count;
    }

    public function getCalculatedTotalLmAttribute(): int
    {
        $total = 0;
        foreach ($this->stowage_layout as $deck) {
            foreach ($deck['lanes'] ?? [] as $lane) {
                $total += (int) ($lane['capacityLM'] ?? $lane['lengthM'] ?? 0);
            }
        }

        return $total;
    }
}
