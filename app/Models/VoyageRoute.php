<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VoyageRoute extends Model
{
    use HasFactory;

    protected $table = 'voyage_routes';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'durationHours' => 'float',
            'distanceNm' => 'integer',
        ];
    }
}
