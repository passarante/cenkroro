<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\GateLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GateTerminalController extends Controller
{
    public function index(Request $request)
    {
        $bookings = Booking::all();
        $gateLogs = GateLog::orderBy('created_at', 'desc')->get();

        $selectedPlate = $request->query('plate', $bookings->first()?->truckPlate ?? '');
        $selectedBooking = $bookings->firstWhere('truckPlate', $selectedPlate) ?? $bookings->first();

        $declaredWeight = $selectedBooking?->weightTon ?? 36.0;
        $measuredWeight = (float) $request->query('measured', $declaredWeight + 0.15);
        $weightDiff = round($measuredWeight - $declaredWeight, 2);
        $isWeightTolerable = abs($weightDiff) <= 1.0;

        return Inertia::render('gate/index', compact(
            'bookings',
            'gateLogs',
            'selectedPlate',
            'selectedBooking',
            'declaredWeight',
            'measuredWeight',
            'weightDiff',
            'isWeightTolerable'
        ));
    }

    public function approveGateIn(Request $request)
    {
        $validated = $request->validate([
            'bookingId' => 'required|string',
            'measuredWeight' => 'required|numeric',
            'sealNumber' => 'nullable|string',
            'gateNumber' => 'nullable|string',
        ]);

        $booking = Booking::findOrFail($validated['bookingId']);
        $nowTime = now()->format('H:i:s');
        $sealNo = $validated['sealNumber'] ?: 'SL-'.rand(10000, 99999).'A';
        $gateNo = $validated['gateNumber'] ?: 'KAPI-1 (Ana Giriş)';

        $diff = round($validated['measuredWeight'] - $booking->weightTon, 2);
        $varianceStr = ($diff >= 0 ? "+{$diff}" : "{$diff}").' ton';

        $booking->update([
            'status' => 'Sahada (Gate-In)',
            'gateInTime' => now()->format('Y-m-d H:i'),
            'kantarWeightTon' => $validated['measuredWeight'],
        ]);

        GateLog::create([
            'id' => 'GL-'.rand(1000, 9999),
            'time' => $nowTime,
            'plate' => $booking->truckPlate,
            'type' => $booking->category,
            'gateNumber' => $gateNo,
            'declaredWeight' => $booking->weightTon,
            'kantarWeight' => $validated['measuredWeight'],
            'variance' => $varianceStr,
            'status' => 'Onaylandı (Geçti)',
            'driver' => $booking->driverName ?? 'Sürücü',
            'sealNumber' => $sealNo,
        ]);

        return redirect()->route('gate.index', ['plate' => $booking->truckPlate])
            ->with('success', "🟢 Kapı Girişi & Kantar Onaylandı! {$booking->truckPlate} sahaya kabul edildi. Mühür: {$sealNo}");
    }
}
