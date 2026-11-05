<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voyage extends Model
{
    protected $table = 'voyages';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected $casts = [
        'durationHours' => 'float',
        'totalCapacityLM' => 'integer',
        'bookedLM' => 'integer',
        'bookedVehicles' => 'integer',
    ];

    public function vessel()
    {
        return $this->belongsTo(Vessel::class, 'vesselId', 'id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'voyageId', 'id');
    }

    public function getCapacityPercentAttribute(): int
    {
        if ($this->totalCapacityLM <= 0) {
            return 0;
        }

        return (int) round(($this->bookedLM / $this->totalCapacityLM) * 100);
    }
}
