<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Port;
use App\Models\Vessel;
use App\Models\Voyage;
use App\Models\VoyageRoute;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VoyageController extends Controller
{
    public function index(Request $request)
    {
        $voyages = Voyage::with('vessel', 'bookings')->get();
        $fleet = Vessel::with('voyages')->get();
        $ports = Port::all();
        $routes = VoyageRoute::all();
        $bookings = Booking::all();

        $activeVoyageId = $request->query('active', $voyages->first()?->id);
        $activeVoyage = $voyages->firstWhere('id', $activeVoyageId) ?? $voyages->first();

        $subTab = $request->query('subtab', 'schedule'); // 'schedule' | 'fleet' | 'ports' | 'routes'

        return Inertia::render('voyages/index', compact('voyages', 'fleet', 'ports', 'routes', 'bookings', 'activeVoyage', 'subTab'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'voyageNumber' => 'required|string',
            'vesselId' => 'required|string',
            'departurePort' => 'required|string',
            'arrivalPort' => 'required|string|different:departurePort',
            'departureTime' => 'required|string',
            'estimatedArrival' => 'required|string',
            'durationHours' => 'nullable|numeric',
            'berth' => 'nullable|string',
        ], [
            'arrivalPort.different' => 'Kalkış ve varış limanı aynı olamaz.',
        ]);

        $vessel = Vessel::find($validated['vesselId']);
        $voyageId = $validated['voyageNumber'];

        // Sefere uygun rota açıklaması
        $route = "{$validated['departurePort']} ➔ {$validated['arrivalPort']}";

        Voyage::create([
            'id' => $voyageId,
            'vesselId' => $vessel?->id,
            'vesselName' => $vessel?->name ?? 'M/V Bilinmiyor',
            'route' => $route,
            'departurePort' => $validated['departurePort'],
            'arrivalPort' => $validated['arrivalPort'],
            'departureTime' => $validated['departureTime'],
            'estimatedArrival' => $validated['estimatedArrival'],
            'durationHours' => $validated['durationHours'] ?? 60.0,
            'status' => 'Planlandı (Scheduled)',
            'totalCapacityLM' => $vessel?->laneMeters ?? 3850,
            'bookedLM' => 0,
            'bookedVehicles' => 0,
            'berth' => $validated['berth'] ?? 'Rıhtım 1',
            'agent' => 'Cenk Ro-Ro Acenteliği',
            'weatherCondition' => 'Sakin (Rüzgar 8 kts)',
        ]);

        return redirect()->route('voyages.index', ['subtab' => 'schedule'])
            ->with('success', "🚢 Yeni sefer [{$voyageId}] başarıyla tanımlandı ve programa eklendi.");
    }

    public function update(Request $request, $id)
    {
        $voyage = Voyage::findOrFail($id);

        $validated = $request->validate([
            'vesselId' => 'required|string',
            'route' => 'required|string',
            'departurePort' => 'required|string',
            'arrivalPort' => 'required|string|different:departurePort',
            'departureTime' => 'required|string',
            'estimatedArrival' => 'required|string',
            'status' => 'required|string',
            'totalCapacityLM' => 'nullable|integer',
            'durationHours' => 'nullable|numeric',
            'berth' => 'nullable|string',
            'weatherCondition' => 'nullable|string',
        ], [
            'arrivalPort.different' => 'Kalkış ve varış limanı aynı olamaz.',
        ]);

        $vessel = Vessel::find($validated['vesselId']);

        $voyage->update([
            'vesselId' => $vessel?->id ?? $voyage->vesselId,
            'vesselName' => $vessel?->name ?? $voyage->vesselName,
            'route' => $validated['route'],
            'departurePort' => $validated['departurePort'],
            'arrivalPort' => $validated['arrivalPort'],
            'departureTime' => $validated['departureTime'],
            'estimatedArrival' => $validated['estimatedArrival'],
            'status' => $validated['status'],
            'totalCapacityLM' => $validated['totalCapacityLM'] ?? $voyage->totalCapacityLM,
            'durationHours' => $validated['durationHours'] ?? $voyage->durationHours,
            'berth' => $validated['berth'] ?? $voyage->berth,
            'weatherCondition' => $validated['weatherCondition'] ?? $voyage->weatherCondition,
        ]);

        return redirect()->route('voyages.index', ['subtab' => 'schedule'])
            ->with('success', "🚢 Sefer [{$id}] bilgileri başarıyla güncellendi.");
    }

    public function destroy($id)
    {
        $voyage = Voyage::findOrFail($id);

        // Bu sefere bağlı rezervasyonların sefer bağlantısını boşalt
        Booking::where('voyageId', $id)->update(['voyageId' => null]);

        $voyage->delete();

        return redirect()->route('voyages.index', ['subtab' => 'schedule'])
            ->with('success', "Sefer [{$id}] başarıyla silindi ve bağlı rezervasyonlar boşa çıkarıldı.");
    }

    // Gemi Yönetimi
    public function storeVessel(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'name' => 'required|string',
            'flag' => 'nullable|string',
            'imo' => 'nullable|string',
            'laneMeters' => 'required|integer',
            'speedKnots' => 'nullable|numeric',
            'reeferPlugs' => 'nullable|integer',
            'status' => 'nullable|string',
        ]);

        $vessel = Vessel::create([
            'id' => $validated['id'],
            'name' => $validated['name'],
            'flag' => $validated['flag'] ?? 'TR 🇹🇷',
            'imo' => $validated['imo'] ?? '9900000',
            'laneMeters' => $validated['laneMeters'],
            'speedKnots' => $validated['speedKnots'] ?? 20.0,
            'reeferPlugs' => $validated['reeferPlugs'] ?? 180,
            'status' => $validated['status'] ?? 'Limanda',
            'decks_json' => ['Weather Deck', 'Upper Deck', 'Main Deck', 'Lower Hold'],
        ]);

        // Otomatik stif şablonu oluştur
        $vessel->stowage_layout_json = $vessel->generateDefaultStowageLayout();
        $vessel->save();

        return redirect()->route('voyages.index', ['subtab' => 'fleet'])
            ->with('success', "🚢 Gemi [{$validated['name']}] ve stif yerleşim planı başarıyla oluşturuldu.");
    }

    public function updateVessel(Request $request, $id)
    {
        $vessel = Vessel::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string',
            'flag' => 'nullable|string',
            'imo' => 'nullable|string',
            'speedKnots' => 'nullable|numeric',
            'reeferPlugs' => 'nullable|integer',
            'status' => 'nullable|string',
            'captain' => 'nullable|string',
        ]);

        $vessel->update($validated);

        return redirect()->route('voyages.index', ['subtab' => 'fleet'])
            ->with('success', "🚢 Gemi [{$vessel->name}] bilgileri güncellendi.");
    }

    public function updateVesselStowage(Request $request, $id)
    {
        $vessel = Vessel::findOrFail($id);

        $request->validate([
            'stowage_layout_json' => 'required|string',
        ]);

        $layout = json_decode($request->input('stowage_layout_json'), true);
        if (! is_array($layout) || empty($layout)) {
            return redirect()->route('voyages.index', ['subtab' => 'fleet'])
                ->with('error', 'Geçersiz stif planlama formatı.');
        }

        // Toplam Şerit Metre (LM) ve Güverte listesini hesapla
        $totalLM = 0;
        $decksList = [];
        foreach ($layout as $deckKey => $deck) {
            $decksList[] = $deckKey;
            foreach ($deck['lanes'] ?? [] as $lane) {
                $totalLM += (int) ($lane['capacityLM'] ?? $lane['lengthM'] ?? 0);
            }
        }

        $vessel->stowage_layout_json = $layout;
        $vessel->decks_json = $decksList;
        if ($totalLM > 0) {
            $vessel->laneMeters = $totalLM;
        }
        $vessel->save();

        return redirect()->route('voyages.index', ['subtab' => 'fleet'])
            ->with('success', "⚓ [{$vessel->name}] gemisinin stif güverte ve şerit tanımları başarıyla kaydedildi. (Toplam: {$totalLM} LM, ".count($decksList).' Güverte)');
    }

    public function destroyVessel($id)
    {
        $vessel = Vessel::findOrFail($id);

        // Bu gemiye bağlı sefer kontrolü
        $voyagesCount = Voyage::where('vesselId', $id)->count();
        if ($voyagesCount > 0) {
            return redirect()->route('voyages.index', ['subtab' => 'fleet'])
                ->with('error', "⚠️ [{$vessel->name}] gemisine ait {$voyagesCount} adet sefer bulunmaktadır. Gemi silinemez.");
        }

        $vessel->delete();

        return redirect()->route('voyages.index', ['subtab' => 'fleet'])
            ->with('success', "Gemi [{$id}] filodan silindi.");
    }

    // Liman Yönetimi
    public function storePort(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'name' => 'required|string',
            'code' => 'required|string',
            'country' => 'required|string',
            'city' => 'nullable|string',
            'type' => 'required|string',
            'berth' => 'nullable|string',
        ]);

        Port::updateOrCreate(['id' => $validated['id']], [
            'name' => $validated['name'],
            'code' => $validated['code'],
            'country' => $validated['country'],
            'city' => $validated['city'] ?? '',
            'type' => $validated['type'],
            'berth' => $validated['berth'] ?? 'Rıhtım 1',
            'hasCustoms' => true,
        ]);

        return redirect()->route('voyages.index', ['subtab' => 'ports'])
            ->with('success', "Liman [{$validated['name']}] başarıyla kaydedildi.");
    }

    public function destroyPort($id)
    {
        Port::findOrFail($id)->delete();

        return redirect()->route('voyages.index', ['subtab' => 'ports'])
            ->with('success', "Liman [{$id}] silindi.");
    }

    // Rota Tanımları Yönetimi
    public function storeRoute(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'name' => 'required|string',
            'code' => 'nullable|string',
            'departurePort' => 'required|string',
            'arrivalPort' => 'required|string|different:departurePort',
            'durationHours' => 'required|numeric|min:0.5',
            'distanceNm' => 'nullable|integer',
            'description' => 'nullable|string',
            'status' => 'required|string',
        ], [
            'arrivalPort.different' => 'Kalkış ve varış limanı aynı olamaz.',
        ]);

        VoyageRoute::updateOrCreate(['id' => $validated['id']], $validated);

        return redirect()->route('voyages.index', ['subtab' => 'routes'])
            ->with('success', "Rota [{$validated['name']}] başarıyla kaydedildi.");
    }

    public function updateRoute(Request $request, $id)
    {
        $route = VoyageRoute::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string',
            'code' => 'nullable|string',
            'departurePort' => 'required|string',
            'arrivalPort' => 'required|string|different:departurePort',
            'durationHours' => 'required|numeric|min:0.5',
            'distanceNm' => 'nullable|integer',
            'description' => 'nullable|string',
            'status' => 'required|string',
        ], [
            'arrivalPort.different' => 'Kalkış ve varış limanı aynı olamaz.',
        ]);

        $route->update($validated);

        return redirect()->route('voyages.index', ['subtab' => 'routes'])
            ->with('success', "Rota [{$route->name}] başarıyla güncellendi.");
    }

    public function destroyRoute($id)
    {
        VoyageRoute::findOrFail($id)->delete();

        return redirect()->route('voyages.index', ['subtab' => 'routes'])
            ->with('success', "Rota [{$id}] silindi.");
    }
}
