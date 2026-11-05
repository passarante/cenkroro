<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Category;
use App\Models\Forwarder;
use App\Models\Voyage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $voyages = Voyage::all();
        $forwarders = Forwarder::all();
        $categories = Category::all();

        $selectedVoyageId = $request->query('voyage', 'ALL');
        $searchTerm = $request->query('search', '');
        $paymentFilter = $request->query('payment', 'ALL');
        $boardingFilter = $request->query('boarding', 'ALL');
        $categoryFilter = $request->query('category', 'ALL');
        $channelFilter = $request->query('channel', 'ALL');

        $query = Booking::query();

        if ($channelFilter !== 'ALL') {
            $query->where('bookingChannel', $channelFilter);
        }

        if ($selectedVoyageId !== 'ALL') {
            if ($selectedVoyageId === 'UNASSIGNED') {
                $query->whereNull('voyageId')->orWhere('voyageId', '');
            } else {
                $query->where('voyageId', $selectedVoyageId);
            }
        }

        if (! empty($searchTerm)) {
            $s = strtolower($searchTerm);
            $query->where(function ($q) use ($s) {
                $q->where('id', 'like', "%{$s}%")
                    ->orWhere('shipper', 'like', "%{$s}%")
                    ->orWhere('truckPlate', 'like', "%{$s}%")
                    ->orWhere('trailerPlate', 'like', "%{$s}%")
                    ->orWhere('driverName', 'like', "%{$s}%")
                    ->orWhere('category', 'like', "%{$s}%");
            });
        }

        if ($paymentFilter !== 'ALL') {
            $query->where('paymentStatus', $paymentFilter);
        }

        if ($boardingFilter !== 'ALL') {
            $query->where('boardingStatus', $boardingFilter);
        }

        if ($categoryFilter !== 'ALL') {
            $query->where('category', 'like', "%{$categoryFilter}%");
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        // Genel / Voyage bazlı KPI Sayaçları
        $allBookings = Booking::all();
        $unassignedCount = $allBookings->filter(fn ($b) => empty($b->voyageId))->count();

        $kpiPool = ($selectedVoyageId === 'ALL') ? $allBookings : $allBookings->where('voyageId', $selectedVoyageId);
        $totalCount = $kpiPool->count();
        $webCount = $kpiPool->where('bookingChannel', 'Web')->count();
        $platformCount = $kpiPool->where('bookingChannel', 'Platform')->count();
        $paidCount = $kpiPool->where('paymentStatus', 'PAID')->count();
        $waitingPaymentCount = $kpiPool->where('paymentStatus', 'WAITING_PAYMENT')->count();
        $pendingApprovalCount = $kpiPool->where('paymentStatus', 'PENDING_APPROVAL')->count();
        $includedCount = $kpiPool->where('boardingStatus', 'INCLUDED')->count();
        $readyToBoardCount = $kpiPool->where('boardingStatus', 'READY_TO_BOARD')->count();
        $failedBoardingCount = $kpiPool->where('boardingStatus', 'FAILED_BOARDING')->count();

        return Inertia::render('bookings/index', compact(
            'bookings',
            'voyages',
            'forwarders',
            'categories',
            'selectedVoyageId',
            'searchTerm',
            'paymentFilter',
            'boardingFilter',
            'categoryFilter',
            'channelFilter',
            'unassignedCount',
            'totalCount',
            'webCount',
            'platformCount',
            'paidCount',
            'waitingPaymentCount',
            'pendingApprovalCount',
            'includedCount',
            'readyToBoardCount',
            'failedBoardingCount'
        ));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'voyageId' => 'nullable|string',
            'shipper' => 'required|string',
            'truckPlate' => 'required|string',
            'trailerPlate' => 'nullable|string',
            'driverName' => 'nullable|string',
            'driverPhone' => 'nullable|string',
            'category' => 'required|string',
            'lengthMeters' => 'required|numeric',
            'weightTon' => 'required|numeric',
            'cargoDescription' => 'nullable|string',
            'cargoType' => 'nullable|string',
            'paymentMethod' => 'nullable|string',
            'paymentAmountEur' => 'nullable|numeric',
            'paymentStatus' => 'nullable|string',
            'isReefer' => 'nullable|boolean',
            'isAdr' => 'nullable|boolean',
        ]);

        $bookingId = 'BK-2026-'.rand(1000, 9999);

        $paymentMethod = $validated['paymentMethod'] ?? 'Cari Hesap';
        $isBank = str_contains(mb_strtolower($paymentMethod), 'banka');
        $paymentStatus = $validated['paymentStatus'] ?? ($isBank ? 'WAITING_PAYMENT' : 'PAID');

        Booking::create([
            'id' => $bookingId,
            'voyageId' => $validated['voyageId'] ?: null,
            'shipper' => $validated['shipper'],
            'truckPlate' => strtoupper(trim($validated['truckPlate'])),
            'trailerPlate' => strtoupper(trim($validated['trailerPlate'] ?? '')),
            'driverName' => $validated['driverName'] ?? 'Sürücü Bildirilmedi',
            'driverPhone' => $validated['driverPhone'] ?? '+90 5',
            'category' => $validated['category'],
            'lengthMeters' => $validated['lengthMeters'],
            'widthMeters' => 2.55,
            'heightMeters' => 4.0,
            'weightTon' => $validated['weightTon'],
            'cargoDescription' => $validated['cargoDescription'] ?? 'Genel Kargo',
            'cargoType' => $validated['cargoType'] ?? 'Genel Kargo',
            'isReefer' => $request->has('isReefer'),
            'isAdr' => $request->has('isAdr'),
            'paymentMethod' => $paymentMethod,
            'paymentAmountEur' => $validated['paymentAmountEur'] ?? 1450.0,
            'paymentStatus' => $paymentStatus,
            'boardingStatus' => 'WAITING_APPROVAL',
            'status' => $paymentStatus === 'WAITING_PAYMENT' ? 'Ödeme Bekleniyor' : 'Rezervasyon Açıldı',
            'bookingChannel' => 'Platform',
            'qrCodeStatus' => 'PENDING',
            'customsStatus' => 'Beklemede (YNS)',
            'mrnNumber' => '26TR3400000'.rand(1000, 9999).'A',
            'riskInfo_json' => [
                'findeksScore' => 'A+ (1550)',
                'limitUsedPct' => 45,
                'status' => $isBank ? 'Banka Havalesi / Dekont Bekleniyor' : 'Cari Limit Uygun',
                'logoVerbisSync' => 'Senkronize',
            ],
            'documents_json' => [
                'uetds' => true,
                'customs' => true,
                'inspection' => true,
                'insurance' => true,
                'summary' => 'U.S. / UETDS Sorgusu Başarılı',
            ],
        ]);

        return redirect()->route('bookings.index', ['voyage' => $validated['voyageId'] ?: 'ALL'])
            ->with('success', "🎫 Yeni bilet/rezervasyon [{$bookingId}] başarıyla oluşturuldu.");
    }

    public function storeBulk(Request $request)
    {
        $validated = $request->validate([
            'voyageId' => 'nullable|string',
            'shipper' => 'required|string',
            'paymentMethod' => 'nullable|string',
            'paymentAmountEur' => 'nullable|numeric',
            'paymentStatus' => 'nullable|string',
            'cargoDescription' => 'nullable|string',
            'vehicles' => 'required|array|min:1',
        ]);

        $rawVehicles = $request->input('vehicles', []);
        $validVehicles = array_filter($rawVehicles, function ($v) {
            return ! empty(trim($v['truckPlate'] ?? ''));
        });

        if (count($validVehicles) === 0) {
            return redirect()->back()->with('error', 'Lütfen en az bir geçerli araç plakası giriniz.');
        }

        $createdIds = [];
        $voyageId = $validated['voyageId'] ?: null;
        $shipper = $validated['shipper'];
        $paymentMethod = $validated['paymentMethod'] ?? 'Cari Hesap';
        $isBank = str_contains(mb_strtolower($paymentMethod), 'banka');
        $paymentAmountEur = $validated['paymentAmountEur'] ?? 1450.0;
        $paymentStatus = $validated['paymentStatus'] ?? ($isBank ? 'WAITING_PAYMENT' : 'PAID');
        $baseCargoDesc = $validated['cargoDescription'] ?? 'Toplu Sevkiyat / Genel Kargo';

        DB::transaction(function () use (
            $validVehicles,
            $voyageId,
            $shipper,
            $paymentMethod,
            $paymentAmountEur,
            $paymentStatus,
            $baseCargoDesc,
            &$createdIds
        ) {
            foreach ($validVehicles as $v) {
                do {
                    $bookingId = 'BK-2026-'.rand(1000, 9999);
                } while (Booking::where('id', $bookingId)->exists());

                $truckPlate = strtoupper(trim($v['truckPlate']));
                $trailerPlate = ! empty($v['trailerPlate']) ? strtoupper(trim($v['trailerPlate'])) : null;
                $driverName = ! empty(trim($v['driverName'] ?? '')) ? trim($v['driverName']) : 'Sürücü Bildirilmedi';
                $driverPhone = ! empty(trim($v['driverPhone'] ?? '')) ? trim($v['driverPhone']) : '+90 5';
                $category = ! empty($v['category']) ? $v['category'] : 'KOMPLE TIR';
                $lengthMeters = ! empty($v['lengthMeters']) ? (float) $v['lengthMeters'] : 16.5;
                $weightTon = ! empty($v['weightTon']) ? (float) $v['weightTon'] : 36.0;
                $isReefer = ! empty($v['isReefer']);
                $isAdr = ! empty($v['isAdr']);

                Booking::create([
                    'id' => $bookingId,
                    'voyageId' => $voyageId,
                    'shipper' => $shipper,
                    'truckPlate' => $truckPlate,
                    'trailerPlate' => $trailerPlate,
                    'driverName' => $driverName,
                    'driverPhone' => $driverPhone,
                    'category' => $category,
                    'lengthMeters' => $lengthMeters,
                    'widthMeters' => 2.55,
                    'heightMeters' => 4.0,
                    'weightTon' => $weightTon,
                    'cargoDescription' => $baseCargoDesc,
                    'cargoType' => 'Genel Kargo',
                    'isReefer' => $isReefer,
                    'isAdr' => $isAdr,
                    'paymentMethod' => $paymentMethod,
                    'paymentAmountEur' => $paymentAmountEur,
                    'paymentStatus' => $paymentStatus,
                    'boardingStatus' => 'WAITING_APPROVAL',
                    'status' => 'Rezervasyon Açıldı',
                    'bookingChannel' => 'Platform',
                    'qrCodeStatus' => 'PENDING',
                    'customsStatus' => 'Beklemede (YNS)',
                    'mrnNumber' => '26TR3400000'.rand(1000, 9999).'A',
                    'riskInfo_json' => [
                        'findeksScore' => 'A+ (1550)',
                        'limitUsedPct' => 45,
                        'status' => 'Toplu Rezervasyon / Cari Limit Uygun',
                        'logoVerbisSync' => 'Senkronize',
                    ],
                    'documents_json' => [
                        'uetds' => true,
                        'customs' => true,
                        'inspection' => true,
                        'insurance' => true,
                        'summary' => 'Toplu Platform Rezervasyonu',
                    ],
                ]);

                $createdIds[] = $bookingId;
            }
        });

        $count = count($createdIds);
        $sample = implode(', ', array_slice($createdIds, 0, 5)).($count > 5 ? '...' : '');

        return redirect()->route('bookings.index', [
            'voyage' => $voyageId ?: 'ALL',
            'channel' => 'Platform',
        ])->with('success', "⚡ Başarılı! Toplam {$count} adet araç için toplu platform rezervasyonu oluşturuldu. (Biletler: {$sample})");
    }

    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $validated = $request->validate([
            'voyageId' => 'nullable|string',
            'shipper' => 'required|string',
            'truckPlate' => 'required|string',
            'trailerPlate' => 'nullable|string',
            'driverName' => 'nullable|string',
            'driverPhone' => 'nullable|string',
            'category' => 'required|string',
            'lengthMeters' => 'required|numeric',
            'weightTon' => 'required|numeric',
            'cargoDescription' => 'nullable|string',
            'paymentMethod' => 'nullable|string',
            'paymentStatus' => 'required|string',
            'boardingStatus' => 'required|string',
            'status' => 'required|string',
            'paymentAmountEur' => 'nullable|numeric',
        ]);

        $booking->update([
            'voyageId' => $validated['voyageId'] ?: null,
            'shipper' => $validated['shipper'],
            'truckPlate' => strtoupper(trim($validated['truckPlate'])),
            'trailerPlate' => strtoupper(trim($validated['trailerPlate'] ?? '')),
            'driverName' => $validated['driverName'],
            'driverPhone' => $validated['driverPhone'],
            'category' => $validated['category'],
            'lengthMeters' => $validated['lengthMeters'],
            'weightTon' => $validated['weightTon'],
            'cargoDescription' => $validated['cargoDescription'],
            'paymentMethod' => $validated['paymentMethod'] ?? $booking->paymentMethod,
            'paymentStatus' => $validated['paymentStatus'],
            'boardingStatus' => $validated['boardingStatus'],
            'status' => $validated['status'],
            'paymentAmountEur' => $validated['paymentAmountEur'] ?? $booking->paymentAmountEur,
        ]);

        return redirect()->route('bookings.index')
            ->with('success', "Bilet [{$id}] bilgileri güncellendi.");
    }

    // Operasyon / Finans ödeme onaylama (Ödeme tipini seçerek onaylar)
    public function approvePayment(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $paymentMethod = $request->input('paymentMethod')
            ?: ($booking->paymentMethod && $booking->paymentMethod !== 'Belirlenmedi' ? $booking->paymentMethod : 'Banka Havalesi / EFT');

        $booking->update([
            'paymentStatus' => 'PAID',
            'paymentMethod' => $paymentMethod,
            'status' => ($booking->status === 'Rezervasyon Açıldı' || $booking->status === 'Ödeme Bekleniyor')
                ? 'Ödeme Alındı / Onaylandı'
                : $booking->status,
        ]);

        return redirect()->back()
            ->with('success', "💳 {$booking->truckPlate} biletinin ödemesi ({$paymentMethod}) onaylandı ve durumu 'Ödendi' olarak güncellendi.");
    }

    public function destroy($id)
    {
        Booking::findOrFail($id)->delete();

        return redirect()->route('bookings.index')
            ->with('success', "Bilet [{$id}] sistemden silindi.");
    }

    // Tek tıkla sefere ata
    public function assignVoyage(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        $voyageId = $request->input('targetVoyageId');

        $booking->update(['voyageId' => $voyageId]);

        return redirect()->back()
            ->with('success', "🚢 {$booking->truckPlate} plakalı araç sefere ({$voyageId}) bağlandı.");
    }

    // Tek tıkla sefere dahil et
    public function includeInVoyage($id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->paymentStatus !== 'PAID') {
            return redirect()->back()
                ->with('error', 'Ödeme tamamlanmadan araç sefere dahil edilemez. Lütfen önce ödemeyi onaylayınız.');
        }

        $booking->update([
            'boardingStatus' => 'INCLUDED',
            'status' => 'Gemide (Loaded)',
            'qrCodeStatus' => 'GENERATED',
        ]);

        return redirect()->back()
            ->with('success', "✅ {$booking->truckPlate} sefere başarıyla DAHİL EDİLDİ ve yüklendi.");
    }

    // Riskli cariye istisnai onay verip sefere dahil etme
    public function riskApproval(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $booking->update([
            'paymentStatus' => 'PAID',
            'boardingStatus' => 'INCLUDED',
            'status' => 'Gemide (Loaded)',
            'qrCodeStatus' => 'GENERATED',
            'riskApproval_json' => [
                'approver' => $request->input('approver', 'Finans Müdürü'),
                'reason' => $request->input('reason', 'Teminat Mektubu / Ek Protokol Alındı'),
                'approvedAt' => now()->toDateTimeString(),
            ],
        ]);

        return redirect()->back()
            ->with('success', "⚠️ Risk onayı kaydedildi: {$booking->truckPlate} sefere dahil edildi.");
    }

    // Biniş yapamadı / İptal tutanağı
    public function failedBoarding(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $booking->update([
            'boardingStatus' => 'FAILED_BOARDING',
            'status' => 'Gemiye Binemedi (İptal)',
            'qrCodeStatus' => 'CANCELLED',
            'failedBoardingDetails_json' => [
                'fault' => $request->input('fault', 'FORW_FAULT'),
                'reason' => $request->input('reason', 'Evrak Eksikliği / Gümrük Problemi'),
                'notes' => $request->input('notes', ''),
                'reportedAt' => now()->toDateTimeString(),
            ],
        ]);

        return redirect()->back()
            ->with('error', "🛑 Biniş iptal tutanağı tutuldu: {$booking->truckPlate} seferden çıkarıldı.");
    }

    // Biniş Kartı (Boarding Pass)
    public function boardingPass($id)
    {
        $booking = Booking::with('voyage')->findOrFail($id);

        if ($booking->bookingChannel === 'Web' && $booking->paymentStatus !== 'PAID') {
            abort(403, 'Web üzerinden gelen rezervasyonlarda ödeme onayı verilmeden biniş kartı yazdırılamaz.');
        }

        return Inertia::render('bookings/boarding-pass', compact('booking'));
    }
}
