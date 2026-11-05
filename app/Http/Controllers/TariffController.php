<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Category;
use App\Models\Port;
use App\Models\Tariff;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TariffController extends Controller
{
    public function index(Request $request)
    {
        $categoryFilter = $request->query('category', 'ALL');
        $search = $request->query('search', '');

        $query = Tariff::query();

        if ($categoryFilter !== 'ALL') {
            $query->where('category', $categoryFilter);
        }

        if (! empty($search)) {
            $s = strtolower($search);
            $query->where(function ($q) use ($s) {
                $q->where('route', 'like', "%{$s}%")
                    ->orWhere('category', 'like', "%{$s}%")
                    ->orWhere('categoryDescription', 'like', "%{$s}%");
            });
        }

        $tariffs = $query->get();
        $categories = Category::all();
        $ports = Port::all();

        return Inertia::render('tariffs/index', compact(
            'tariffs',
            'categories',
            'ports',
            'categoryFilter',
            'search'
        ));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string',
            'categoryDescription' => 'nullable|string',
            'route' => 'required|string',
            'currency' => 'required|string',
            'basePriceUsd' => 'required|numeric',
            'validFrom' => 'required|string',
            'validTo' => 'required|string',
            'status' => 'required|string',
            'reeferSurchargeUsd' => 'nullable|numeric',
            'adrSurchargeUsd' => 'nullable|numeric',
            'maxGrossWeightTon' => 'nullable|numeric',
            'maxLengthMeters' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $id = 'TRF-2026-'.rand(100, 999);

        Tariff::create([
            'id' => $id,
            'category' => $validated['category'],
            'categoryDescription' => $validated['categoryDescription'] ?? '',
            'route' => $validated['route'],
            'currency' => $validated['currency'],
            'basePriceUsd' => $validated['basePriceUsd'],
            'validFrom' => $validated['validFrom'],
            'validTo' => $validated['validTo'],
            'status' => $validated['status'],
            'reeferSurchargeUsd' => $validated['reeferSurchargeUsd'] ?? 150.0,
            'adrSurchargeUsd' => $validated['adrSurchargeUsd'] ?? 120.0,
            'ispsSecurityFeeUsd' => 45.0,
            'bafFuelSurchargeUsd' => 95.0,
            'maxGrossWeightTon' => $validated['maxGrossWeightTon'] ?? 40.0,
            'maxLengthMeters' => $validated['maxLengthMeters'] ?? 16.5,
            'includesLashing' => true,
            'includesWeighing' => true,
            'notes' => $validated['notes'] ?? '',
        ]);

        return redirect()->route('tariffs.index')
            ->with('success', "💰 Yeni navlun tarifesi [{$id}] başarıyla eklendi.");
    }

    public function update(Request $request, $id)
    {
        $tariff = Tariff::findOrFail($id);

        $validated = $request->validate([
            'category' => 'required|string',
            'categoryDescription' => 'nullable|string',
            'route' => 'required|string',
            'currency' => 'required|string',
            'basePriceUsd' => 'required|numeric',
            'validFrom' => 'required|string',
            'validTo' => 'required|string',
            'status' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $tariff->update($validated);

        return redirect()->route('tariffs.index')
            ->with('success', "Tarife [{$id}] güncellendi.");
    }

    public function destroy($id)
    {
        Tariff::findOrFail($id)->delete();

        return redirect()->route('tariffs.index')
            ->with('success', "Tarife [{$id}] silindi.");
    }

    // Araç Kategori Tanımları
    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'desc' => 'nullable|string',
            'icon' => 'nullable|string',
            'defaultLengthM' => 'required|numeric',
            'defaultMaxWeightTon' => 'required|numeric',
        ]);

        $id = 'CAT-'.rand(10, 99);

        Category::create([
            'id' => $id,
            'name' => $validated['name'],
            'desc' => $validated['desc'] ?? '',
            'icon' => $validated['icon'] ?: '🚚',
            'defaultLengthM' => $validated['defaultLengthM'],
            'defaultMaxWeightTon' => $validated['defaultMaxWeightTon'],
            'isReeferCapable' => $request->has('isReeferCapable'),
            'isAdrCapable' => $request->has('isAdrCapable'),
        ]);

        return redirect()->route('tariffs.index')
            ->with('success', "🚛 Yeni araç kategorisi [{$validated['name']}] eklendi.");
    }

    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string',
            'desc' => 'nullable|string',
            'icon' => 'nullable|string',
            'defaultLengthM' => 'required|numeric',
            'defaultMaxWeightTon' => 'required|numeric',
        ]);

        $oldName = $category->name;
        $newName = $validated['name'];

        $category->update([
            'name' => $newName,
            'desc' => $validated['desc'] ?? '',
            'icon' => $validated['icon'] ?: ($category->icon ?? '🚚'),
            'defaultLengthM' => $validated['defaultLengthM'],
            'defaultMaxWeightTon' => $validated['defaultMaxWeightTon'],
            'isReeferCapable' => $request->has('isReeferCapable'),
            'isAdrCapable' => $request->has('isAdrCapable'),
        ]);

        if ($oldName !== $newName) {
            Tariff::where('category', $oldName)->update(['category' => $newName]);
        }

        return redirect()->route('tariffs.index')
            ->with('success', "✏️ Araç kategorisi [{$newName}] başarıyla güncellendi.");
    }

    public function destroyCategory($id)
    {
        $category = Category::findOrFail($id);
        $name = $category->name;

        // Kontrol: Rezervasyonlarda bu kategori kullanılıyor mu?
        $usedInBookings = Booking::where('vehicleCategory', $name)->count();
        if ($usedInBookings > 0) {
            return redirect()->route('tariffs.index')
                ->with('error', "⚠️ [{$name}] kategorisine ait {$usedInBookings} adet aktif rezervasyon bulunmaktadır. Önce rezervasyonları güncelleyiniz.");
        }

        $category->delete();

        return redirect()->route('tariffs.index')
            ->with('success', "🗑️ [{$name}] kategorisi başarıyla silindi.");
    }
}
