<?php

use App\Mail\OtpCodeMail;
use App\Models\Booking;
use App\Models\User;
use App\Models\Voyage;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    // Seed demo voyages if none
    if (Voyage::count() === 0) {
        Voyage::create([
            'id' => 'VY-TEST-01',
            'vesselName' => 'M/V TEST STAR',
            'route' => 'Pendik ➔ Trieste',
            'status' => 'Planlandı',
            'departureTime' => '2026-11-10 18:00',
            'totalCapacityLM' => 3800,
            'bookedLM' => 1200,
            'bookedVehicles' => 45,
        ]);
    }
});

test('admin can access all modules including user management', function () {
    $admin = User::create([
        'name' => 'Sistem Yöneticisi',
        'email' => 'admin_test@cenkroro.com',
        'password' => Hash::make('password123'),
        'role' => 'admin',
        'status' => 'active',
        'permissions_json' => array_keys(User::MODULES),
    ]);

    $this->actingAs($admin)->get('/dashboard')->assertOk();
    $this->actingAs($admin)->get('/voyages')->assertOk();
    $this->actingAs($admin)->get('/bookings')->assertOk();
    $this->actingAs($admin)->get('/stowage')->assertOk();
    $this->actingAs($admin)->get('/customs')->assertOk();
    $this->actingAs($admin)->get('/gate')->assertOk();
    $this->actingAs($admin)->get('/forwarders')->assertOk();
    $this->actingAs($admin)->get('/tariffs')->assertOk();
    $this->actingAs($admin)->get('/portal')->assertOk();
    $this->actingAs($admin)->get('/users')->assertOk();
});

test('admin can add, toggle status and delete users', function () {
    $admin = User::create([
        'name' => 'Sistem Yöneticisi',
        'email' => 'admin_ops@cenkroro.com',
        'password' => Hash::make('password123'),
        'role' => 'admin',
        'status' => 'active',
    ]);

    // 1. Yeni Operasyon Kullanıcısı Ekleme
    $storeResponse = $this->actingAs($admin)->post('/users/store', [
        'name' => 'Yeni Operatör',
        'email' => 'operator_new@cenkroro.com',
        'password' => 'secret123',
        'role' => 'operation',
        'status' => 'active',
        'permissions_json' => ['voyages', 'bookings'],
    ]);
    $storeResponse->assertRedirect(route('users.index'));

    $newUser = User::where('email', 'operator_new@cenkroro.com')->first();
    expect($newUser)->not->toBeNull()
        ->and($newUser->role)->toBe('operation')
        ->and($newUser->permissions_json)->toBe(['voyages', 'bookings']);

    // 2. Kullanıcıyı Pasife Alma (toggle status)
    $toggleResponse = $this->actingAs($admin)->post("/users/toggle-status/{$newUser->id}");
    $toggleResponse->assertRedirect(route('users.index'));
    $newUser->refresh();
    expect($newUser->status)->toBe('inactive');

    // 3. Kullanıcıyı Tekrar Aktife Alma
    $this->actingAs($admin)->post("/users/toggle-status/{$newUser->id}");
    $newUser->refresh();
    expect($newUser->status)->toBe('active');

    // 4. Kullanıcıyı Silme
    $deleteResponse = $this->actingAs($admin)->post("/users/destroy/{$newUser->id}");
    $deleteResponse->assertRedirect(route('users.index'));
    expect(User::find($newUser->id))->toBeNull();
});

test('inactive users are blocked from logging in with password', function () {
    $inactiveUser = User::create([
        'name' => 'Pasif Kullanıcı',
        'email' => 'pasif@cenkroro.com',
        'password' => Hash::make('secret123'),
        'role' => 'operation',
        'status' => 'inactive',
    ]);

    $response = $this->post('/login', [
        'email' => 'pasif@cenkroro.com',
        'password' => 'secret123',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('operation user can access permitted modules but is blocked from unpermitted modules and users table', function () {
    $operationUser = User::create([
        'name' => 'Operasyon Personeli',
        'email' => 'operasyon_test@cenkroro.com',
        'password' => Hash::make('secret123'),
        'role' => 'operation',
        'status' => 'active',
        'permissions_json' => ['voyages', 'bookings'],
    ]);

    // İzin verilen modüller
    $this->actingAs($operationUser)->get('/voyages')->assertOk();
    $this->actingAs($operationUser)->get('/bookings')->assertOk();

    // İzin verilmeyen modül (stowage)
    $this->actingAs($operationUser)->get('/stowage')->assertForbidden();

    // Kullanıcı yönetimi (sadece admin erişebilir)
    $this->actingAs($operationUser)->get('/users')->assertForbidden();
});

test('field user can request OTP, verify and log in', function () {
    $email = 'surucu_test@lojistik.com';

    // 1. OTP İsteği
    $requestResponse = $this->post('/login/otp/send', [
        'email' => $email,
    ]);
    $requestResponse->assertRedirect();
    $requestResponse->assertSessionHas('otp_sent_to', $email);

    $fieldUser = User::where('email', $email)->first();
    expect($fieldUser)->not->toBeNull()
        ->and($fieldUser->role)->toBe('field')
        ->and($fieldUser->otp_code)->not->toBeNull()
        ->and(strlen($fieldUser->otp_code))->toBe(6);

    $otp = $fieldUser->otp_code;

    // 2. Yanlış OTP Kodu ile deneme
    $failResponse = $this->post('/login/otp/verify', [
        'email' => $email,
        'otp_code' => '000000',
    ]);
    $failResponse->assertSessionHasErrors('otp_code');
    $this->assertGuest();

    // 3. Doğru OTP Kodu ile doğrulama
    $successResponse = $this->post('/login/otp/verify', [
        'email' => $email,
        'otp_code' => $otp,
    ]);
    $successResponse->assertRedirect(route('portal.index'));
    $this->assertAuthenticatedAs($fieldUser);

    // Kodu sıfırlanmış olmalı
    $fieldUser->refresh();
    expect($fieldUser->otp_code)->toBeNull();
});

test('field user is redirected away from management modules to portal', function () {
    $fieldUser = User::create([
        'name' => 'Saha Şoförü Ali',
        'email' => 'ali@sahatasima.com',
        'role' => 'field',
        'status' => 'active',
        'company_name' => 'Ali Nakliyat',
    ]);

    // Portal erişilebilir olmalı
    $this->actingAs($fieldUser)->get('/portal')->assertOk();

    // Yönetim modülleri portala yönlendirmeli
    $this->actingAs($fieldUser)->get('/voyages')->assertRedirect(route('portal.index'));
    $this->actingAs($fieldUser)->get('/bookings')->assertRedirect(route('portal.index'));
    $this->actingAs($fieldUser)->get('/stowage')->assertRedirect(route('portal.index'));
});

test('field user can submit reservation with their own typed company name', function () {
    $fieldUser = User::create([
        'name' => 'Murat Şahin',
        'email' => 'murat@sahatasima.com',
        'phone' => '+905321112233',
        'role' => 'field',
        'status' => 'active',
        'company_name' => 'Şahin Ekspres Lojistik',
    ]);

    $voyage = Voyage::first();

    $response = $this->actingAs($fieldUser)->post('/portal/submit', [
        'voyageId' => $voyage->id,
        'shipper' => 'Şahin Ekspres Lojistik',
        'contactName' => 'Murat',
        'contactSurname' => 'Şahin',
        'contactMail' => 'murat@sahatasima.com',
        'contactPhone' => '+905321112233',
        'driverName' => 'Murat Şahin',
        'driverPhone' => '+905321112233',
        'truckPlate' => '34 SHN 01',
        'trailerPlate' => '34 DOR 01',
        'weightTon' => 32.5,
        'vehicleKind' => 'Komple TIR',
        'trailerType' => 'Tenteli',
        'hasElectricity' => '0',
        'paymentMethod' => 'Banka',
    ]);

    $response->assertRedirect();

    $booking = Booking::where('truckPlate', '34 SHN 01')->first();
    expect($booking)->not->toBeNull()
        ->and($booking->shipper)->toBe('Şahin Ekspres Lojistik')
        ->and($booking->contactMail)->toBe('murat@sahatasima.com')
        ->and($booking->bookingChannel)->toBe('Web');

    // Portalda geçmiş işlem olarak listelenmeli
    $portalResponse = $this->actingAs($fieldUser)->get('/portal?tab=history');
    $portalResponse->assertOk();
});

test('seeded admin accounts can authenticate with provided passwords and access dashboard', function () {
    $this->seed(DatabaseSeeder::class);

    $admins = [
        ['email' => 'guneydirim@gmail.com', 'password' => '75787578'],
        ['email' => 'cigdem@cenkroro.com', 'password' => '1234578*'],
        ['email' => 'hakan@3sgrup.com', 'password' => '75787578'],
    ];

    foreach ($admins as $adminData) {
        $response = $this->post('/login', [
            'email' => $adminData['email'],
            'password' => $adminData['password'],
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticated();
        Auth::logout();
    }
});

test('otp login redirects to reservation portal with selected voyage', function () {
    Mail::fake();

    $this->get('/login/otp?redirect=/portal&voyageId=VY-TEST-01')->assertOk();

    // 1. Send OTP
    $sendResponse = $this->post('/login/otp/send', [
        'email' => 'sofor@lojistik.com',
    ]);
    $sendResponse->assertRedirect();

    Mail::assertSent(OtpCodeMail::class, function ($mail) {
        return $mail->hasTo('sofor@lojistik.com') && ! empty($mail->otpCode);
    });

    $user = User::where('email', 'sofor@lojistik.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->otp_code)->not->toBeNull();

    // 2. Verify OTP and expect redirect to portal with voyageId
    $verifyResponse = $this->post('/login/otp/verify', [
        'email' => 'sofor@lojistik.com',
        'otp_code' => $user->otp_code,
    ]);

    $verifyResponse->assertRedirect('/portal?tab=book&voyageId=VY-TEST-01');
    $this->assertAuthenticatedAs($user);
});
