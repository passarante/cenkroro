<?php

use App\Models\Booking;
use App\Models\Forwarder;
use App\Models\Vessel;
use App\Models\Voyage;
use Database\Seeders\RoRoDatabaseSeeder;

beforeEach(function () {
    $this->seed(RoRoDatabaseSeeder::class);
});

test('landing page loads with real database entities', function () {
    $response = $this->get('/');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('landing')
        ->has('voyages')
        ->has('vessels')
        ->has('tariffs')
        ->has('forwarders')
    );
});

test('operations dashboard renders successfully with real db entities', function () {
    $response = $this->get('/dashboard');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('activeVoyage')
        ->has('fleet')
        ->has('bookings')
        ->has('recentBookings')
    );
});

test('voyages management page displays vessels, ports and schedule', function () {
    $response = $this->get('/voyages');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('voyages/index')
        ->has('voyages')
        ->has('fleet')
        ->has('ports')
    );
});

test('bookings management page lists all bookings with filters', function () {
    $response = $this->get('/bookings');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('bookings/index')
        ->has('bookings')
        ->has('voyages')
    );
});

test('boarding pass printable document renders for existing booking', function () {
    $booking = Booking::first();
    if ($booking) {
        $response = $this->get("/bookings/boarding-pass/{$booking->id}");
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('bookings/boarding-pass')
            ->has('booking')
        );
    } else {
        expect(true)->toBeTrue();
    }
});

test('stowage 2D deck plan renders with lanes and unstowed vehicles queue', function () {
    $response = $this->get('/stowage');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('stowage/index')
        ->has('vessels')
        ->has('currentVessel')
        ->has('deckLanesWithUnits')
        ->has('unstowedQueue')
    );
});

test('customs dashboard and official manifest render', function () {
    $indexResponse = $this->get('/customs');
    $indexResponse->assertOk();
    $indexResponse->assertInertia(fn ($page) => $page
        ->component('customs/index')
        ->has('bookings')
        ->has('voyages')
    );

    $manifestResponse = $this->get('/customs/manifest');
    $manifestResponse->assertOk();
    $manifestResponse->assertInertia(fn ($page) => $page
        ->component('customs/official-manifest')
        ->has('voyage')
        ->has('bookings')
    );
});

test('gate terminal interface loads live OCR and scale integration', function () {
    $response = $this->get('/gate');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('gate/index')
        ->has('bookings')
        ->has('gateLogs')
        ->has('selectedBooking')
    );
});

test('forwarders cari risk management page loads accounts and credit limits', function () {
    $response = $this->get('/forwarders');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('forwarders/index')
        ->has('forwarders')
        ->has('totalLimitEur')
        ->has('totalBalanceEur')
    );
});

test('tariffs page lists rates and vehicle categories', function () {
    $response = $this->get('/tariffs');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('tariffs/index')
        ->has('tariffs')
        ->has('categories')
    );
});

test('mobile web booking portal handles self-service bookings', function () {
    $response = $this->get('/portal');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('portal/index')
        ->has('voyages')
        ->has('forwarders')
    );
});

test('vessel operational status reflects voyage state or defaults to limanda', function () {
    $vessel = Vessel::create([
        'id' => 'TEST-VESSEL',
        'name' => 'M/V TEST STAR',
        'laneMeters' => 3000,
        'status' => 'Aktif (Seyirde)', // even if stored as this in db
    ]);

    // When no voyage exists, status must be Limanda (not Seyirde)
    expect($vessel->status)->toBe('Limanda');

    // Create scheduled voyage (not started)
    $voyage = Voyage::create([
        'id' => 'VOY-TEST-01',
        'vesselId' => $vessel->id,
        'vesselName' => $vessel->name,
        'route' => 'Pendik ➔ Trieste',
        'departurePort' => 'Pendik',
        'arrivalPort' => 'Trieste',
        'departureTime' => '2026-11-05 20:00',
        'estimatedArrival' => '2026-11-08 08:00',
        'status' => 'Planlandı (Scheduled)',
        'totalCapacityLM' => 3000,
        'bookedLM' => 0,
    ]);

    // Voyage is scheduled, not underway
    $vessel->unsetRelation('voyages');
    expect($vessel->status)->toBe('Limanda (Planlandı)');

    // Start voyage (Seyirde)
    $voyage->update(['status' => 'Seyirde (Underway)']);
    $vessel->unsetRelation('voyages');
    expect($vessel->status)->toBe('Seyirde (Underway)');
});

test('voyage store rejects identical departure and arrival ports', function () {
    $vessel = Vessel::first();

    $response = $this->post('/voyages/store', [
        'voyageNumber' => 'VOY-SAME-TEST',
        'vesselId' => $vessel->id,
        'departurePort' => 'Haydarpaşa Limanı',
        'arrivalPort' => 'Haydarpaşa Limanı',
        'departureTime' => '2026-11-05 20:00',
        'estimatedArrival' => '2026-11-08 08:00',
    ]);

    $response->assertSessionHasErrors(['arrivalPort' => 'Kalkış ve varış limanı aynı olamaz.']);
});

test('voyages page loads routes and supports route CRUD operations', function () {
    // 1. Page renders routes prop
    $response = $this->get('/voyages?subtab=routes');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('voyages/index')
        ->has('routes')
        ->where('subTab', 'routes')
    );

    // 2. Create new route
    $storeResponse = $this->post('/voyages/route/store', [
        'id' => 'ROT-TEST-01',
        'name' => 'İzmir ➔ Bari Hattı',
        'code' => 'IZM-BAR',
        'departurePort' => 'Çeşme Ulusoy Terminali (İzmir)',
        'arrivalPort' => 'Taranto Port, İtalya',
        'durationHours' => 36.0,
        'distanceNm' => 600,
        'description' => 'Test deniz hattı',
        'status' => 'Aktif',
    ]);
    $storeResponse->assertRedirect('/voyages?subtab=routes');
    $this->assertDatabaseHas('voyage_routes', ['id' => 'ROT-TEST-01', 'name' => 'İzmir ➔ Bari Hattı']);

    // 3. Update route
    $updateResponse = $this->post('/voyages/route/update/ROT-TEST-01', [
        'name' => 'İzmir ➔ Bari Güncellenmiş Hattı',
        'code' => 'IZM-BAR-2',
        'departurePort' => 'Çeşme Ulusoy Terminali (İzmir)',
        'arrivalPort' => 'Taranto Port, İtalya',
        'durationHours' => 40.0,
        'distanceNm' => 650,
        'description' => 'Güncel test rotası',
        'status' => 'Aktif',
    ]);
    $updateResponse->assertRedirect('/voyages?subtab=routes');
    $this->assertDatabaseHas('voyage_routes', ['id' => 'ROT-TEST-01', 'name' => 'İzmir ➔ Bari Güncellenmiş Hattı']);

    // 4. Reject identical ports in route
    $invalidRouteResponse = $this->post('/voyages/route/store', [
        'id' => 'ROT-INVALID',
        'name' => 'Geçersiz Rota',
        'departurePort' => 'Yalova Ro-Ro Terminali',
        'arrivalPort' => 'Yalova Ro-Ro Terminali',
        'durationHours' => 20,
        'status' => 'Aktif',
    ]);
    $invalidRouteResponse->assertSessionHasErrors(['arrivalPort' => 'Kalkış ve varış limanı aynı olamaz.']);

    // 5. Delete route
    $deleteResponse = $this->post('/voyages/route/destroy/ROT-TEST-01');
    $deleteResponse->assertRedirect('/voyages?subtab=routes');
    $this->assertDatabaseMissing('voyage_routes', ['id' => 'ROT-TEST-01']);
});

test('booking creation with Cari Hesap payment method sets paymentStatus to PAID', function () {
    $response = $this->post('/bookings/store', [
        'voyageId' => null,
        'shipper' => 'Ekol Lojistik Test',
        'truckPlate' => '34 CARI 001',
        'trailerPlate' => '34 CARI 002',
        'driverName' => 'Ahmet Cari',
        'driverPhone' => '+90 532 000 0001',
        'category' => 'Komple TIR',
        'lengthMeters' => 16.5,
        'weightTon' => 36.0,
        'paymentMethod' => 'Cari Hesap',
        'paymentAmountEur' => 1450.0,
    ]);

    $response->assertRedirect();
    $booking = Booking::where('truckPlate', '34 CARI 001')->first();
    expect($booking)->not->toBeNull();
    expect($booking->paymentMethod)->toBe('Cari Hesap');
    expect($booking->paymentStatus)->toBe('PAID');
    expect($booking->status)->toBe('Rezervasyon Açıldı');
});

test('booking creation with Banka payment method sets paymentStatus to WAITING_PAYMENT', function () {
    $response = $this->post('/bookings/store', [
        'voyageId' => null,
        'shipper' => 'Mars Lojistik Test',
        'truckPlate' => '34 BNK 001',
        'trailerPlate' => '34 BNK 002',
        'driverName' => 'Mehmet Banka',
        'driverPhone' => '+90 532 000 0002',
        'category' => 'Komple TIR',
        'lengthMeters' => 16.5,
        'weightTon' => 36.0,
        'paymentMethod' => 'Banka',
        'paymentAmountEur' => 1450.0,
    ]);

    $response->assertRedirect();
    $booking = Booking::where('truckPlate', '34 BNK 001')->first();
    expect($booking)->not->toBeNull();
    expect($booking->paymentMethod)->toBe('Banka');
    expect($booking->paymentStatus)->toBe('WAITING_PAYMENT');
    expect($booking->status)->toBe('Ödeme Bekleniyor');
});

test('approve payment route approves bank payment and changes paymentStatus to PAID', function () {
    $booking = Booking::create([
        'id' => 'BK-TEST-BANK-01',
        'shipper' => 'Borusan Lojistik Test',
        'truckPlate' => '34 ONY 001',
        'category' => 'Komple TIR',
        'lengthMeters' => 16.5,
        'weightTon' => 35.0,
        'paymentMethod' => 'Banka',
        'paymentStatus' => 'WAITING_PAYMENT',
        'boardingStatus' => 'WAITING_APPROVAL',
        'status' => 'Ödeme Bekleniyor',
        'bookingChannel' => 'Platform',
    ]);

    $response = $this->post("/bookings/approve-payment/{$booking->id}");
    $response->assertRedirect();

    $booking->refresh();
    expect($booking->paymentStatus)->toBe('PAID');
    expect($booking->status)->toBe('Ödeme Alındı / Onaylandı');
});

test('include in voyage is rejected when payment is not completed', function () {
    $booking = Booking::create([
        'id' => 'BK-TEST-INC-FAIL',
        'shipper' => 'Ekol Lojistik Test',
        'truckPlate' => '34 NOINC 01',
        'category' => 'Komple TIR',
        'lengthMeters' => 16.5,
        'weightTon' => 32.0,
        'paymentMethod' => 'Banka',
        'paymentStatus' => 'WAITING_PAYMENT',
        'boardingStatus' => 'WAITING_APPROVAL',
        'status' => 'Ödeme Bekleniyor',
        'bookingChannel' => 'Platform',
    ]);

    $response = $this->post("/bookings/include/{$booking->id}");
    $response->assertRedirect();
    $response->assertSessionHas('error');

    $booking->refresh();
    expect($booking->boardingStatus)->toBe('WAITING_APPROVAL');
});

test('include in voyage succeeds when payment is PAID and documents are verified', function () {
    $booking = Booking::create([
        'id' => 'BK-TEST-INC-PASS',
        'shipper' => 'Ekol Lojistik Test',
        'truckPlate' => '34 INC 01',
        'category' => 'Komple TIR',
        'lengthMeters' => 16.5,
        'weightTon' => 32.0,
        'paymentMethod' => 'Cari Hesap',
        'paymentStatus' => 'PAID',
        'boardingStatus' => 'WAITING_APPROVAL',
        'status' => 'Rezervasyon Açıldı',
        'bookingChannel' => 'Platform',
        'documents_json' => [
            'verified' => true,
            'summary' => 'Evraklar Doğrulandı',
        ],
    ]);

    $response = $this->post("/bookings/include/{$booking->id}");
    $response->assertRedirect();
    $response->assertSessionHas('success');

    $booking->refresh();
    expect($booking->boardingStatus)->toBe('INCLUDED');
});

test('web portal booking saves manual firm name on booking without creating unapproved forwarder', function () {
    $newFirmName = 'Yeni Test Lojistik A.Ş.';
    expect(Forwarder::where('name', $newFirmName)->exists())->toBeFalse();

    $response = $this->post('/portal/submit', [
        'voyageId' => 'VOY-452',
        'shipper' => $newFirmName,
        'contactName' => 'Ali',
        'contactSurname' => 'Yılmaz',
        'contactMail' => 'ali@yenitest.com',
        'contactPhone' => '0532 999 8877',
        'driverName' => 'Hasan Usta',
        'driverPhone' => '0555 444 3322',
        'truckPlate' => '34 NEW 99',
        'weightTon' => 30.0,
        'vehicleKind' => 'Çekici',
        'trailerType' => 'Tenteli',
    ]);

    $response->assertRedirect();
    // Booking is created with the manual shipper name
    $booking = Booking::where('truckPlate', '34 NEW 99')->first();
    expect($booking)->not->toBeNull();
    expect($booking->shipper)->toBe($newFirmName);

    // Forwarder table remains clean of unapproved manual web entries (ERP/accounting approval required)
    expect(Forwarder::where('name', $newFirmName)->exists())->toBeFalse();
});

test('web booking boarding pass is blocked with 403 until payment is approved', function () {
    $booking = Booking::create([
        'id' => 'BK-TEST-WEB-99',
        'voyageId' => 'VOY-452',
        'shipper' => 'Ekol Lojistik',
        'truckPlate' => '34 WB 101',
        'category' => 'Komple TIR',
        'lengthMeters' => 16.5,
        'weightTon' => 34.0,
        'paymentMethod' => 'Banka',
        'paymentStatus' => 'WAITING_PAYMENT',
        'boardingStatus' => 'WAITING_APPROVAL',
        'status' => 'Ödeme Bekleniyor',
        'bookingChannel' => 'Web',
    ]);

    // Unpaid Web booking cannot view/print boarding pass
    $blockedResponse = $this->get("/bookings/boarding-pass/{$booking->id}");
    $blockedResponse->assertStatus(403);

    // Approve payment
    $approveResponse = $this->post("/bookings/approve-payment/{$booking->id}");
    $approveResponse->assertSessionHas('success');

    $booking->refresh();
    expect($booking->paymentStatus)->toBe('PAID');

    // After approval, boarding pass is accessible
    $allowedResponse = $this->get("/bookings/boarding-pass/{$booking->id}");
    $allowedResponse->assertOk();
    $allowedResponse->assertInertia(fn ($page) => $page
        ->component('bookings/boarding-pass')
        ->has('booking')
    );
});

test('operations officer can approve payment and select payment method', function () {
    $booking = Booking::create([
        'id' => 'BK-TEST-OP-PAY',
        'shipper' => 'Mars Lojistik Test',
        'truckPlate' => '34 MARS 99',
        'category' => 'Komple TIR',
        'lengthMeters' => 16.5,
        'weightTon' => 34.0,
        'paymentMethod' => 'Belirlenmedi',
        'paymentStatus' => 'WAITING_PAYMENT',
        'boardingStatus' => 'WAITING_APPROVAL',
        'status' => 'Ödeme Bekleniyor',
        'bookingChannel' => 'Web',
    ]);

    $response = $this->post("/bookings/approve-payment/{$booking->id}", [
        'paymentMethod' => 'Cari Hesap',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $booking->refresh();
    expect($booking->paymentStatus)->toBe('PAID');
    expect($booking->paymentMethod)->toBe('Cari Hesap');
    expect($booking->status)->toBe('Ödeme Alındı / Onaylandı');
});

test('vehicle cannot be boarded onto ship before documents are verified', function () {
    $booking = Booking::create([
        'id' => 'BK-TEST-DOC-CHECK',
        'voyageId' => 'VOY-452',
        'shipper' => 'Test Lojistik A.Ş.',
        'truckPlate' => '34 DOC 01',
        'category' => 'Komple TIR',
        'lengthMeters' => 16.5,
        'weightTon' => 34.0,
        'paymentMethod' => 'Cari Hesap',
        'paymentStatus' => 'PAID', // Paid, but documents not verified
        'boardingStatus' => 'WAITING_APPROVAL',
        'status' => 'Rezervasyon Açıldı',
        'bookingChannel' => 'Web',
        'documents_json' => [
            'verified' => false,
            'summary' => 'Evrak Doğrulaması Bekleniyor',
        ],
    ]);

    // Attempting to include in voyage must fail because documents are not verified
    $response = $this->post("/bookings/include/{$booking->id}");
    $response->assertSessionHas('error');
    expect(session('error'))->toContain('Evrak doğrulaması tamamlanmadan araç');

    $booking->refresh();
    expect($booking->boardingStatus)->not->toBe('INCLUDED');

    // Now perform document verification
    $verifyResponse = $this->post("/bookings/verify-documents/{$booking->id}", [
        'ruhsat' => true,
        'cmr' => true,
        'customs' => true,
        'driver_license' => true,
        'insurance' => true,
        'isVerified' => true,
        'notes' => 'Tüm evraklar fiziki olarak kontrol edildi ve onaylandı.',
        'simulatedFiles' => [
            ['name' => 'CMR_34DOC01.pdf', 'size' => '1.2 MB', 'type' => 'application/pdf'],
        ],
    ]);

    $verifyResponse->assertRedirect();
    $verifyResponse->assertSessionHas('success');

    $booking->refresh();
    expect($booking->documents_json['verified'])->toBeTrue();
    expect($booking->documents_json['files'])->toHaveCount(1);

    // Now include in voyage succeeds
    $includeResponse = $this->post("/bookings/include/{$booking->id}");
    $includeResponse->assertSessionHas('success');

    $booking->refresh();
    expect($booking->boardingStatus)->toBe('INCLUDED');
    expect($booking->status)->toBe('Gemide (Loaded)');
});
