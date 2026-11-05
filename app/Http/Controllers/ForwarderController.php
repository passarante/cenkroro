<?php

namespace App\Http\Controllers;

use App\Models\Forwarder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ForwarderController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $riskFilter = $request->query('risk', 'ALL');

        $query = Forwarder::query();

        if (! empty($search)) {
            $s = strtolower($search);
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('code', 'like', "%{$s}%")
                    ->orWhere('contactPerson', 'like', "%{$s}%")
                    ->orWhere('taxNumber', 'like', "%{$s}%");
            });
        }

        if ($riskFilter !== 'ALL') {
            if ($riskFilter === 'LIMIT_EXCEEDED') {
                $query->whereColumn('currentBalanceEur', '>', 'creditLimitEur');
            } elseif ($riskFilter === 'BLOCKED') {
                $query->where('status', 'like', '%Bloke%')->orWhere('status', 'like', '%Askı%');
            }
        }

        $forwarders = $query->get();

        $totalLimitEur = Forwarder::sum('creditLimitEur');
        $totalBalanceEur = Forwarder::sum('currentBalanceEur');
        $blockedCount = Forwarder::where('status', 'like', '%Bloke%')->orWhere('status', 'like', '%Askı%')->count();

        return Inertia::render('forwarders/index', compact(
            'forwarders',
            'search',
            'riskFilter',
            'totalLimitEur',
            'totalBalanceEur',
            'blockedCount'
        ));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'code' => 'nullable|string',
            'country' => 'nullable|string',
            'city' => 'nullable|string',
            'taxOffice' => 'nullable|string',
            'taxNumber' => 'nullable|string',
            'creditLimitEur' => 'required|numeric',
            'currentBalanceEur' => 'nullable|numeric',
            'contactPerson' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|string',
            'paymentTermDays' => 'nullable|integer',
        ]);

        $id = 'FWD-'.rand(100, 999);

        Forwarder::create([
            'id' => $id,
            'name' => $validated['name'],
            'code' => $validated['code'] ?: 'FWD-'.strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $validated['name']), 0, 3)),
            'country' => $validated['country'] ?? 'Türkiye',
            'city' => $validated['city'] ?? 'İstanbul',
            'taxOffice' => $validated['taxOffice'] ?? '',
            'taxNumber' => $validated['taxNumber'] ?? '',
            'creditLimitEur' => $validated['creditLimitEur'],
            'currentBalanceEur' => $validated['currentBalanceEur'] ?? 0.0,
            'rating' => 'A+',
            'contactPerson' => $validated['contactPerson'] ?? '',
            'phone' => $validated['phone'] ?? '',
            'email' => $validated['email'] ?? '',
            'paymentTermDays' => $validated['paymentTermDays'] ?? 30,
            'status' => 'Aktif',
            'hasFrigoAgreement' => true,
            'hasAdrAgreement' => true,
        ]);

        return redirect()->route('forwarders.index')
            ->with('success', "🏢 Yeni firma [{$validated['name']}] başarıyla kaydedildi.");
    }

    public function update(Request $request, $id)
    {
        $forwarder = Forwarder::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string',
            'code' => 'nullable|string',
            'taxOffice' => 'nullable|string',
            'taxNumber' => 'nullable|string',
            'creditLimitEur' => 'required|numeric',
            'currentBalanceEur' => 'required|numeric',
            'contactPerson' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|string',
            'status' => 'required|string',
        ]);

        $forwarder->update($validated);

        return redirect()->route('forwarders.index')
            ->with('success', "Firma [{$forwarder->name}] cari ve limit bilgileri güncellendi.");
    }

    public function destroy($id)
    {
        Forwarder::findOrFail($id)->delete();

        return redirect()->route('forwarders.index')
            ->with('success', 'Firma kaydı silindi.');
    }

    public function toggleBlock($id)
    {
        $forwarder = Forwarder::findOrFail($id);
        $newStatus = str_contains($forwarder->status, 'Bloke') ? 'Aktif' : 'Askıda / Bloke';

        $forwarder->update(['status' => $newStatus]);

        return redirect()->back()
            ->with('info', "Firma [{$forwarder->name}] durumu değiştirildi: {$newStatus}");
    }
}
