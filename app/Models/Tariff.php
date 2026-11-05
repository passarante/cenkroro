<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tariff extends Model
{
    protected $table = 'tariffs';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected $casts = [
        'basePriceUsd' => 'float',
        'reeferSurchargeUsd' => 'float',
        'adrSurchargeUsd' => 'float',
        'ispsSecurityFeeUsd' => 'float',
        'bafFuelSurchargeUsd' => 'float',
        'maxGrossWeightTon' => 'float',
        'maxLengthMeters' => 'float',
        'includesLashing' => 'boolean',
        'includesWeighing' => 'boolean',
    ];
}
