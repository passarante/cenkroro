<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Category;
use App\Models\Forwarder;
use App\Models\Tariff;
use App\Models\Voyage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MobilePortalController extends Controller
{
    public function index(Request $request)
    {
        $voyages = Voyage::all();
        $activeVoyage = Voyage::first();
        $forwarders = Forwarder::all();
        $tariffs = Tariff::all();
        $categories = Category::all();

        $activeTab = $request->query('tab', 'book'); // 'book' | 'pnr' | 'schedule' | 'guide'
        $pnrSearch = $request->query('pnr', '');

        $inquiryResult = null;
        if (! empty($pnrSearch)) {
            $inquiryResult = Booking::where('id', 'like', "%{$pnrSearch}%")
                ->orWhere('truckPlate', 'like', "%{$pnrSearch}%")
                ->orWhere('mrnNumber', 'like', "%{$pnrSearch}%")
                ->first();
        }

        $user = $request->user();
        $myBookings = [];
        if ($user) {
            $myBookings = Booking::with('voyage')->where(function ($q) use ($user) {
                if (! empty($user->email)) {
                    $q->orWhere('contactMail', $user->email);
                }
                if (! empty($user->company_name)) {
                    $q->orWhere('shipper', 'like', "%{$user->company_name}%");
                }
                if (! empty($user->phone)) {
                    $q->orWhere('driverPhone', $user->phone)->orWhere('contactPhone', $user->phone);
                }
            })->orderBy('created_at', 'desc')->get();
        }

        $selectedVoyageId = $request->query('voyageId', $request->query('voyage', ''));

        return Inertia::render('portal/index', compact(
            'voyages',
            'activeVoyage',
            'forwarders',
            'tariffs',
            'categories',
            'activeTab',
            'pnrSearch',
            'inquiryResult',
            'myBookings',
            'selectedVoyageId'
        ));
    }

    public function submitBooking(Request $request)
    {
        $validated = $request->validate([
            'voyageId' => 'required|string',
            'shipper' => 'required|string',
            'contactName' => 'nullable|string',
            'contactSurname' => 'nullable|string',
            'contactMail' => 'nullable|string',
            'contactPhone' => 'nullable|string',
            'driverName' => 'required|string',
            'driverPhone' => 'required|string',
            'truckPlate' => 'required|string',
            'trailerPlate' => 'nullable|string',
            'weightTon' => 'nullable|numeric',
            'vehicleKind' => 'nullable|string',
            'trailerType' => 'nullable|string',
            'hasElectricity' => 'nullable|string',
            'category' => 'nullable|string',
            'paymentMethod' => 'nullable|string',
        ]);

        $bookingId = 'BK-2026-'.rand(1000, 9999);
        $hasElec = ($request->input('hasElectricity') === '1' || str_contains($request->input('trailerType', ''), 'Frigo'));
        $cat = $validated['vehicleKind'] ?? $validated['category'] ?? 'Komple TIR';

        $booking = Booking::create([
            'id' => $bookingId,
            'voyageId' => $validated['voyageId'],
            'shipper' => $validated['shipper'],
            'contactName' => $validated['contactName'] ?? null,
            'contactSurname' => $validated['contactSurname'] ?? null,
            'contactMail' => $validated['contactMail'] ?? null,
            'contactPhone' => $validated['contactPhone'] ?? null,
            'driverName' => $validated['driverName'],
            'driverPhone' => $validated['driverPhone'],
            'truckPlate' => strtoupper(trim($validated['truckPlate'])),
            'trailerPlate' => strtoupper(trim($validated['trailerPlate'] ?? '')),
            'weightTon' => (float) ($validated['weightTon'] ?? 34.0),
            'vehicleKind' => $validated['vehicleKind'] ?? 'Çekici + Yarı Römork',
            'trailerType' => $validated['trailerType'] ?? 'Tenteli Standart',
            'category' => $cat,
            'lengthMeters' => 16.5,
            'widthMeters' => 2.55,
            'heightMeters' => 4.0,
            'isReefer' => $hasElec,
            'hasElectricity' => $hasElec,
            'cargoDescription' => 'Web Portalı Genel Kargo / Ticari Sevkiyat',
            'cargoType' => 'Genel Kargo',
            'paymentMethod' => ! empty($validated['paymentMethod']) ? $validated['paymentMethod'] : 'Belirlenmedi',
            'paymentAmountEur' => 1650.0,
            'paymentStatus' => 'WAITING_PAYMENT',
            'boardingStatus' => 'WAITING_APPROVAL',
            'status' => 'Ödeme Bekleniyor',
            'bookingChannel' => 'Web',
            'qrCodeStatus' => 'GENERATED',
            'customsStatus' => 'Beklemede (YNS)',
            'mrnNumber' => '26TR3400000'.rand(1000, 9999).'B',
            'riskInfo_json' => [
                'findeksScore' => 'A+ (1680)',
                'limitUsedPct' => 35,
                'status' => 'Web Rezervasyon Kaydı',
                'logoVerbisSync' => 'Senkronize',
            ],
            'documents_json' => [
                'uetds' => true,
                'customs' => true,
                'inspection' => true,
                'insurance' => true,
                'summary' => 'Web Portalı Başvurusu',
            ],
        ]);

        return redirect()->route('portal.index', ['tab' => 'pnr', 'pnr' => $bookingId])
            ->with('success', "🎉 Ön rezervasyonunuz başarıyla alındı! PNR Kodunuz: {$bookingId}. Operasyon onayından sonra e-posta ile bilgilendirileceksiniz.");
    }
}
