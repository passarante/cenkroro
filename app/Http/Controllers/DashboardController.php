<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\DeckConfiguration;
use App\Models\Forwarder;
use App\Models\Vessel;
use App\Models\Voyage;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $voyages = Voyage::all();
        $activeVoyage = Voyage::first();
        $fleet = Vessel::all();
        $bookings = Booking::all();
        $forwarders = Forwarder::all();
        $deckConfigs = DeckConfiguration::all()->pluck('config_json', 'deckKey');

        // Calculations
        $activeVoyageBookings = $activeVoyage
            ? Booking::where('voyageId', $activeVoyage->id)->get()
            : $bookings;

        $totalCapacityLM = $activeVoyage ? $activeVoyage->totalCapacityLM : 3850;
        $bookedLM = $activeVoyage ? $activeVoyage->bookedLM : $activeVoyageBookings->sum('lengthMeters');
        $capacityPercent = $totalCapacityLM > 0 ? (int) round(($bookedLM / $totalCapacityLM) * 100) : 0;

        $loadedCount = $activeVoyageBookings->where('status', 'Gemide (Loaded)')->count();
        $gateInCount = $activeVoyageBookings->where('status', 'Sahada (Gate-In)')->count();
        $pendingApprovalCount = $activeVoyageBookings->where('boardingStatus', 'WAITING_APPROVAL')->count();

        $totalRevenue = $activeVoyageBookings->where('paymentStatus', 'PAID')->sum('paymentAmountEur');
        $unpaidCount = $activeVoyageBookings->where('paymentStatus', '!=', 'PAID')->count();
        $riskCount = $forwarders->where('riskStatus', '!=', 'Teminat İçi')->count();

        $recentBookings = Booking::orderBy('created_at', 'desc')->take(8)->get();

        return Inertia::render('dashboard', compact(
            'voyages',
            'activeVoyage',
            'fleet',
            'bookings',
            'forwarders',
            'deckConfigs',
            'totalCapacityLM',
            'bookedLM',
            'capacityPercent',
            'loadedCount',
            'gateInCount',
            'pendingApprovalCount',
            'totalRevenue',
            'unpaidCount',
            'riskCount',
            'recentBookings'
        ));
    }
}
