<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\DeckConfiguration;
use App\Models\Vessel;
use App\Models\Voyage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StowageController extends Controller
{
    public function index(Request $request)
    {
        $vessels = Vessel::all();
        $activeVoyage = Voyage::where('status', '!=', 'Tamamlandı (Completed)')->first() ?? Voyage::first();

        // 1. Seçili Gemiyi Belirle (İstek -> Aktif Seferin Gemisi -> İlk Gemi)
        $selectedVesselId = $request->query('vessel');
        if (! $selectedVesselId && $activeVoyage && $activeVoyage->vesselId) {
            $selectedVesselId = $activeVoyage->vesselId;
        }

        $currentVessel = ($selectedVesselId ? Vessel::find($selectedVesselId) : null) ?? $vessels->first();

        // Eğer veritabanı tamamen boşsa güvenli varsayılan gemi sağla
        if (! $currentVessel) {
            $currentVessel = Vessel::firstOrCreate(
                ['id' => 'VES-01'],
                [
                    'name' => 'M/V CENK T',
                    'flag' => 'TR 🇹🇷',
                    'imo' => '9874211',
                    'laneMeters' => 3850,
                    'speedKnots' => 21.4,
                    'reeferPlugs' => 180,
                    'status' => 'Yüklemede (Loading)',
                ]
            );
            $vessels = Vessel::all();
        }

        // 2. Gemi Tanımlarından Stif Güverte ve Şerit Yerleşimini Al
        $vesselLayout = $currentVessel ? $currentVessel->stowage_layout : [];
        $allDeckKeys = array_keys($vesselLayout);

        // 3. Seçili Güverteyi Belirle
        $selectedDeckKey = $request->query('deck', $allDeckKeys[0] ?? 'Main Deck');
        if (! in_array($selectedDeckKey, $allDeckKeys) && ! empty($allDeckKeys)) {
            $selectedDeckKey = $allDeckKeys[0];
        }

        // 4. Bu Gemi ve Güverteye Ait Kayıtlı İstif Verilerini Çek
        $deckConfigModel = $currentVessel ? DeckConfiguration::getForVesselAndDeck($currentVessel->id, $selectedDeckKey) : null;
        $storedData = $deckConfigModel ? (is_array($deckConfigModel->config_json) ? $deckConfigModel->config_json : json_decode($deckConfigModel->config_json, true)) : [];

        $deckDef = $vesselLayout[$selectedDeckKey] ?? [
            'name' => $selectedDeckKey,
            'clearHeight' => 4.8,
            'maxWeightTon' => 1200,
            'hasFrigoPlugs' => true,
            'lanes' => [],
        ];

        $currentDeck = array_merge($deckDef, $storedData ?? []);
        // Şerit tanımları doğrudan gemi tanımından gelir!
        $currentDeck['lanes'] = $deckDef['lanes'] ?? [];
        $currentDeck['stowedUnits'] = (! empty($storedData['stowedUnits']) && is_array($storedData['stowedUnits'])) ? $storedData['stowedUnits'] : [];

        // 5. Bu Gemideki Tüm Güvertelere Yerleştirilmiş Araçların ID'leri
        $allStowedIds = [];
        if ($currentVessel) {
            $vesselConfigs = DeckConfiguration::where('vessel_id', $currentVessel->id)
                ->orWhere('deckKey', 'like', "{$currentVessel->id}_%")
                ->get();

            // İlk aktarılan legacy veriler VES-01 içinse onları da dahil et
            if ($currentVessel->id === 'VES-01') {
                $legacyConfigs = DeckConfiguration::whereIn('deckKey', ['Main Deck', 'Lower Hold', 'Weather Deck', 'Upper Deck'])->get();
                $vesselConfigs = $vesselConfigs->merge($legacyConfigs);
            }

            foreach ($vesselConfigs as $conf) {
                $cData = is_array($conf->config_json) ? $conf->config_json : json_decode($conf->config_json, true);
                if (! empty($cData['stowedUnits'])) {
                    foreach ($cData['stowedUnits'] as $u) {
                        if (! empty($u['bookingId'])) {
                            $allStowedIds[] = $u['bookingId'];
                        }
                    }
                }
            }
        }

        // 6. Geminin Şerit Bazında Yük Dağılımını Hesapla
        $deckLanesWithUnits = [];
        $totalDeckUsedLM = 0;
        $totalDeckUsedTon = 0;
        $totalDeckCapacityLM = 0;

        foreach ($currentDeck['lanes'] as $lane) {
            $lNo = $lane['laneNo'] ?? $lane['lane'] ?? 1;
            $laneUnits = array_values(array_filter($currentDeck['stowedUnits'], function ($u) use ($lNo) {
                return isset($u['lane']) && $u['lane'] == $lNo;
            }));

            $usedLM = array_sum(array_map(fn ($u) => (float) ($u['lengthM'] ?? 0), $laneUnits));
            $usedTon = array_sum(array_map(fn ($u) => (float) ($u['weightTon'] ?? 0), $laneUnits));
            $capLM = (float) ($lane['capacityLM'] ?? $lane['lengthM'] ?? 0);

            $totalDeckUsedLM += $usedLM;
            $totalDeckUsedTon += $usedTon;
            $totalDeckCapacityLM += $capLM;

            $deckLanesWithUnits[] = [
                'lane' => $lane,
                'units' => $laneUnits,
                'usedLM' => $usedLM,
                'usedTon' => $usedTon,
                'percent' => $capLM > 0 ? (int) round(($usedLM / $capLM) * 100) : 0,
            ];
        }

        // 7. Bekleme Kuyruğu (Henüz bir şeride istiflenmemiş biniş onaylı araçlar)
        $bookings = Booking::all();
        $unstowedQueue = $bookings->filter(function ($b) use ($allStowedIds) {
            return ! in_array($b->id, $allStowedIds) && $b->boardingStatus !== 'FAILED_BOARDING';
        });

        return Inertia::render('stowage/index', compact(
            'vessels',
            'currentVessel',
            'activeVoyage',
            'selectedDeckKey',
            'allDeckKeys',
            'currentDeck',
            'deckLanesWithUnits',
            'unstowedQueue',
            'totalDeckUsedLM',
            'totalDeckUsedTon',
            'totalDeckCapacityLM'
        ));
    }

    public function stowVehicle(Request $request)
    {
        $validated = $request->validate([
            'vesselId' => 'nullable|string',
            'deckKey' => 'required|string',
            'bookingId' => 'required|string',
            'lane' => 'required|integer',
        ]);

        $vesselId = $validated['vesselId'] ?? 'VES-01';
        $deckKey = $validated['deckKey'];
        $laneNo = $validated['lane'];
        $booking = Booking::findOrFail($validated['bookingId']);

        // Gemiye özel composite key
        $compositeKey = "{$vesselId}_{$deckKey}";
        $deckConfigModel = DeckConfiguration::where('deckKey', $compositeKey)->first();
        if (! $deckConfigModel) {
            // VES-01 fallback
            if ($vesselId === 'VES-01') {
                $deckConfigModel = DeckConfiguration::find($deckKey);
            }
        }

        if (! $deckConfigModel) {
            $deckConfigModel = new DeckConfiguration;
            $deckConfigModel->deckKey = $compositeKey;
            $deckConfigModel->vessel_id = $vesselId;
            $deckConfigModel->config_json = ['stowedUnits' => []];
        }

        $storedData = is_array($deckConfigModel->config_json) ? $deckConfigModel->config_json : json_decode($deckConfigModel->config_json ?? '{}', true);
        $stowedUnits = $storedData['stowedUnits'] ?? [];

        // Zaten ekli mi kontrol et
        $exists = false;
        foreach ($stowedUnits as $u) {
            if ($u['bookingId'] === $booking->id) {
                $exists = true;
                break;
            }
        }

        if (! $exists) {
            $stowedUnits[] = [
                'bookingId' => $booking->id,
                'plate' => $booking->truckPlate,
                'shipper' => $booking->shipper,
                'category' => $booking->vehicleCategory ?? $booking->category,
                'lengthM' => (float) $booking->lengthMeters,
                'weightTon' => (float) $booking->weightTon,
                'isReefer' => (bool) $booking->isReefer,
                'isAdr' => (bool) $booking->isAdr,
                'deck' => $deckKey,
                'lane' => $laneNo,
                'slot' => count(array_filter($stowedUnits, fn ($u) => ($u['lane'] ?? null) == $laneNo)) + 1,
            ];

            $storedData['stowedUnits'] = $stowedUnits;
            $deckConfigModel->vessel_id = $vesselId;
            $deckConfigModel->config_json = $storedData;
            $deckConfigModel->save();

            // Rezervasyonu güncelle
            $booking->update([
                'status' => 'Gemide (Loaded)',
                'boardingStatus' => 'INCLUDED',
                'deck' => $deckKey,
                'lane' => $laneNo,
            ]);
        }

        return redirect()->route('stowage.index', ['vessel' => $vesselId, 'deck' => $deckKey])
            ->with('success', "⚓ {$booking->truckPlate} başarıyla [{$vesselId}] {$deckKey} - Şerit {$laneNo}'e yerleştirildi.");
    }

    public function unstowVehicle(Request $request)
    {
        $validated = $request->validate([
            'vesselId' => 'nullable|string',
            'deckKey' => 'required|string',
            'bookingId' => 'required|string',
        ]);

        $vesselId = $validated['vesselId'] ?? 'VES-01';
        $deckKey = $validated['deckKey'];
        $bookingId = $validated['bookingId'];

        $compositeKey = "{$vesselId}_{$deckKey}";
        $deckConfigModel = DeckConfiguration::where('deckKey', $compositeKey)->first() ?? DeckConfiguration::find($deckKey);

        if ($deckConfigModel) {
            $storedData = is_array($deckConfigModel->config_json) ? $deckConfigModel->config_json : json_decode($deckConfigModel->config_json, true);
            $stowedUnits = $storedData['stowedUnits'] ?? [];

            $storedData['stowedUnits'] = array_values(array_filter($stowedUnits, fn ($u) => $u['bookingId'] !== $bookingId));
            $deckConfigModel->config_json = $storedData;
            $deckConfigModel->save();
        }

        $booking = Booking::find($bookingId);
        if ($booking) {
            $booking->update([
                'status' => 'Sahada (Gate-In)',
                'deck' => null,
                'lane' => null,
            ]);
        }

        return redirect()->route('stowage.index', ['vessel' => $vesselId, 'deck' => $deckKey])
            ->with('info', 'Araç güverteden indirildi ve bekleme kuyruğuna alındı.');
    }

    public function resetDeck(Request $request)
    {
        $vesselId = $request->input('vesselId', 'VES-01');
        $deckKey = $request->input('deckKey', 'Main Deck');

        $compositeKey = "{$vesselId}_{$deckKey}";
        $deckConfigModel = DeckConfiguration::where('deckKey', $compositeKey)->first() ?? DeckConfiguration::find($deckKey);

        if ($deckConfigModel) {
            $storedData = is_array($deckConfigModel->config_json) ? $deckConfigModel->config_json : json_decode($deckConfigModel->config_json, true);
            $storedData['stowedUnits'] = [];
            $deckConfigModel->config_json = $storedData;
            $deckConfigModel->save();
        }

        return redirect()->route('stowage.index', ['vessel' => $vesselId, 'deck' => $deckKey])
            ->with('info', "[{$vesselId}] {$deckKey} stif planı sıfırlandı.");
    }
}
