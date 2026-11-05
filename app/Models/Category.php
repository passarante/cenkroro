<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'categories';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected $casts = [
        'defaultLengthM' => 'float',
        'defaultMaxWeightTon' => 'float',
        'isReeferCapable' => 'boolean',
        'isAdrCapable' => 'boolean',
    ];
}
