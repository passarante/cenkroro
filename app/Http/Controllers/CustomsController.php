<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Voyage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomsController extends Controller
{
    public function index(Request $request)
    {
        $voyages = Voyage::all();
        $activeVoyageId = $request->query('voyage', $voyages->first()?->id);
        $activeVoyage = $voyages->firstWhere('id', $activeVoyageId) ?? $voyages->first();

        $filterHat = $request->query('hat', 'ALL'); // 'ALL' | 'Yeşil' | 'Sarı' | 'Kırmızı'

        $query = Booking::query();
        if ($activeVoyage) {
            $query->where('voyageId', $activeVoyage->id);
        }

        if ($filterHat !== 'ALL') {
            $query->where('customsStatus', 'like', "%{$filterHat}%");
        }

        $bookings = $query->get();

        $allVoyageBookings = $activeVoyage ? Booking::where('voyageId', $activeVoyage->id)->get() : Booking::all();
        $totalGrossWeight = $allVoyageBookings->sum('weightTon');
        $totalWeightKg = (int) round($totalGrossWeight * 1000);
        $totalLM = $allVoyageBookings->sum('lengthMeters');

        $ynsCount = $allVoyageBookings->filter(fn ($b) => str_contains($b->customsStatus ?? '', 'Yeşil'))->count();
        $sariCount = $allVoyageBookings->filter(fn ($b) => str_contains($b->customsStatus ?? '', 'Sarı'))->count();
        $kirmiziCount = $allVoyageBookings->filter(fn ($b) => str_contains($b->customsStatus ?? '', 'Kırmızı'))->count();
        $reeferCount = $allVoyageBookings->where('isReefer', true)->count();
        $adrCount = $allVoyageBookings->where('isAdr', true)->count();

        $manifestNo = 'MNF-2026/'.preg_replace('/[^0-9]/', '', $activeVoyage?->id ?? '081');
        $bilgeNo = '26TR340800-MNF-'.($activeVoyage?->id ?? 'VOY-081');

        return Inertia::render('customs/index', compact(
            'voyages',
            'activeVoyage',
            'bookings',
            'filterHat',
            'totalGrossWeight',
            'totalWeightKg',
            'totalLM',
            'ynsCount',
            'sariCount',
            'kirmiziCount',
            'reeferCount',
            'adrCount',
            'manifestNo',
            'bilgeNo'
        ));
    }

    public function officialManifest(Request $request, $voyageId = null)
    {
        $voyageId = $voyageId ?: Voyage::first()?->id;
        $voyage = $voyageId ? Voyage::find($voyageId) : null;

        if (! $voyage) {
            $voyage = Voyage::first() ?? Voyage::create([
                'id' => 'VOY-081',
                'vesselId' => 'VES-01',
                'vesselName' => 'M/V EGE STAR',
                'route' => 'Pendik ➔ Trieste',
                'departurePort' => 'Pendik Ro-Ro Terminali',
                'arrivalPort' => 'Trieste Port (Molo VII)',
                'departureTime' => '2026-11-01 22:00',
                'estimatedArrival' => '2026-11-04 10:00',
                'durationHours' => 60.0,
                'status' => 'Yüklemede (Loading)',
                'totalCapacityLM' => 3850,
                'bookedLM' => 0,
                'bookedVehicles' => 0,
                'berth' => 'Rıhtım 1',
                'agent' => 'Cenk Ro-Ro Acenteliği',
                'weatherCondition' => 'Sakin (Rüzgar 8 kts)',
            ]);
            $voyageId = $voyage->id;
        }
        $bookings = Booking::where('voyageId', $voyageId)->get();

        $totalGrossWeight = $bookings->sum('weightTon');
        $totalWeightKg = (int) round($totalGrossWeight * 1000);
        $totalLM = $bookings->sum('lengthMeters');

        $manifestNo = 'MNF-2026/'.preg_replace('/[^0-9]/', '', $voyage->id);
        $bilgeNo = '26TR340800-MNF-'.$voyage->id;

        return Inertia::render('customs/official-manifest', compact(
            'voyage',
            'bookings',
            'totalGrossWeight',
            'totalWeightKg',
            'totalLM',
            'manifestNo',
            'bilgeNo'
        ));
    }
}
