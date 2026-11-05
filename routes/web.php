<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\CustomsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ForwarderController;
use App\Http\Controllers\GateTerminalController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\MobilePortalController;
use App\Http\Controllers\StowageController;
use App\Http\Controllers\TariffController;
use App\Http\Controllers\VoyageController;
use Illuminate\Support\Facades\Route;

// Cenk Ro-Ro Karşılama Ana Sayfası (Landing Page)
Route::get('/', [LandingController::class, 'index'])->name('home');

// Platform Operasyon Masası / Dashboard
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/platform', [DashboardController::class, 'index'])->name('platform');

// 1. Sefer Yönetimi & Gemi / Liman Tanımları
Route::prefix('voyages')->name('voyages.')->group(function () {
    Route::get('/', [VoyageController::class, 'index'])->name('index');
    Route::post('/store', [VoyageController::class, 'store'])->name('store');
    Route::post('/update/{id}', [VoyageController::class, 'update'])->name('update');
    Route::post('/destroy/{id}', [VoyageController::class, 'destroy'])->name('destroy');

    Route::post('/vessel/store', [VoyageController::class, 'storeVessel'])->name('vessel.store');
    Route::post('/vessel/update/{id}', [VoyageController::class, 'updateVessel'])->name('vessel.update');
    Route::post('/vessel/stowage/{id}', [VoyageController::class, 'updateVesselStowage'])->name('vessel.stowage');
    Route::post('/vessel/destroy/{id}', [VoyageController::class, 'destroyVessel'])->name('vessel.destroy');

    Route::post('/port/store', [VoyageController::class, 'storePort'])->name('port.store');
    Route::post('/port/destroy/{id}', [VoyageController::class, 'destroyPort'])->name('port.destroy');

    Route::post('/route/store', [VoyageController::class, 'storeRoute'])->name('route.store');
    Route::post('/route/update/{id}', [VoyageController::class, 'updateRoute'])->name('route.update');
    Route::post('/route/destroy/{id}', [VoyageController::class, 'destroyRoute'])->name('route.destroy');
});

// 2. Rezervasyon & Biniş Yönetimi
Route::prefix('bookings')->name('bookings.')->group(function () {
    Route::get('/', [BookingController::class, 'index'])->name('index');
    Route::post('/store', [BookingController::class, 'store'])->name('store');
    Route::post('/bulk-store', [BookingController::class, 'storeBulk'])->name('bulk_store');
    Route::post('/update/{id}', [BookingController::class, 'update'])->name('update');
    Route::post('/destroy/{id}', [BookingController::class, 'destroy'])->name('destroy');
    Route::post('/assign/{id}', [BookingController::class, 'assignVoyage'])->name('assign');
    Route::post('/include/{id}', [BookingController::class, 'includeInVoyage'])->name('include');
    Route::post('/approve-payment/{id}', [BookingController::class, 'approvePayment'])->name('approve_payment');
    Route::post('/risk-approval/{id}', [BookingController::class, 'riskApproval'])->name('risk_approval');
    Route::post('/failed-boarding/{id}', [BookingController::class, 'failedBoarding'])->name('failed_boarding');
    Route::get('/boarding-pass/{id}', [BookingController::class, 'boardingPass'])->name('boarding_pass');
});

// 3. Stif Planı / Güverte Yerleşimi
Route::prefix('stowage')->name('stowage.')->group(function () {
    Route::get('/', [StowageController::class, 'index'])->name('index');
    Route::post('/stow', [StowageController::class, 'stowVehicle'])->name('stow');
    Route::post('/unstow', [StowageController::class, 'unstowVehicle'])->name('unstow');
    Route::post('/reset', [StowageController::class, 'resetDeck'])->name('reset');
});

// 4. Gümrük ve Manifesto
Route::prefix('customs')->name('customs.')->group(function () {
    Route::get('/', [CustomsController::class, 'index'])->name('index');
    Route::get('/manifest/{voyageId?}', [CustomsController::class, 'officialManifest'])->name('official_manifest');
});

// 5. Kantar ve Terminal Kapı Kontrolü
Route::prefix('gate')->name('gate.')->group(function () {
    Route::get('/', [GateTerminalController::class, 'index'])->name('index');
    Route::post('/approve', [GateTerminalController::class, 'approveGateIn'])->name('approve');
});

// 6. Firma ve Cari Risk Yönetimi
Route::prefix('forwarders')->name('forwarders.')->group(function () {
    Route::get('/', [ForwarderController::class, 'index'])->name('index');
    Route::post('/store', [ForwarderController::class, 'store'])->name('store');
    Route::post('/update/{id}', [ForwarderController::class, 'update'])->name('update');
    Route::post('/destroy/{id}', [ForwarderController::class, 'destroy'])->name('destroy');
    Route::post('/toggle-block/{id}', [ForwarderController::class, 'toggleBlock'])->name('toggle_block');
});

// 7. Tarife ve Fiyat Listesi
Route::prefix('tariffs')->name('tariffs.')->group(function () {
    Route::get('/', [TariffController::class, 'index'])->name('index');
    Route::post('/store', [TariffController::class, 'store'])->name('store');
    Route::post('/update/{id}', [TariffController::class, 'update'])->name('update');
    Route::post('/destroy/{id}', [TariffController::class, 'destroy'])->name('destroy');

    Route::post('/category/store', [TariffController::class, 'storeCategory'])->name('category.store');
    Route::post('/category/update/{id}', [TariffController::class, 'updateCategory'])->name('category.update');
    Route::post('/category/destroy/{id}', [TariffController::class, 'destroyCategory'])->name('category.destroy');
});

// 8. Sürücü ve Acente Portalı (Mobil Uyumlu)
Route::prefix('portal')->name('portal.')->group(function () {
    Route::get('/', [MobilePortalController::class, 'index'])->name('index');
    Route::post('/submit', [MobilePortalController::class, 'submitBooking'])->name('submit');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
