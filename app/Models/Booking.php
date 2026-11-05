<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $table = 'bookings';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected $casts = [
        'lengthMeters' => 'float',
        'widthMeters' => 'float',
        'heightMeters' => 'float',
        'weightTon' => 'float',
        'isReefer' => 'boolean',
        'hasElectricity' => 'boolean',
        'reeferTemp' => 'float',
        'isAdr' => 'boolean',
        'paymentAmountEur' => 'float',
        'kantarWeightTon' => 'float',
        'lane' => 'integer',
        'slot' => 'integer',
        'riskInfo_json' => 'array',
        'documents_json' => 'array',
        'failedBoardingDetails_json' => 'array',
        'riskApproval_json' => 'array',
    ];

    public function voyage()
    {
        return $this->belongsTo(Voyage::class, 'voyageId', 'id');
    }

    public function forwarder()
    {
        return $this->belongsTo(Forwarder::class, 'shipper', 'name');
    }
}
