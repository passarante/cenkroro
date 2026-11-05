<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Forwarder extends Model
{
    protected $table = 'forwarders';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected $casts = [
        'creditLimitEur' => 'float',
        'currentBalanceEur' => 'float',
        'discountPercent' => 'float',
        'paymentTermDays' => 'integer',
        'allocatedLM' => 'integer',
        'hasFrigoAgreement' => 'boolean',
        'hasAdrAgreement' => 'boolean',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'shipper', 'name');
    }
}
