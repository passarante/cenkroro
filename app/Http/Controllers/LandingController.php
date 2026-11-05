<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Category;
use App\Models\Forwarder;
use App\Models\Tariff;
use App\Models\Vessel;
use App\Models\Voyage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingController extends Controller
{
    /**
     * Display the official Cenk Ro-Ro landing page.
     */
    public function index(Request $request)
    {
        $voyages = Voyage::all();
        $vessels = Vessel::all();
        $tariffs = Tariff::all();
        $forwarders = Forwarder::orderBy('name')->get();
        $categories = Category::all();

        // PNR search query if provided
        $pnrQuery = trim($request->get('pnr', ''));
        $searchResult = null;
        if (! empty($pnrQuery)) {
            $searchResult = Booking::with('voyage')
                ->where('id', 'LIKE', "%{$pnrQuery}%")
                ->orWhere('truckPlate', 'LIKE', "%{$pnrQuery}%")
                ->orWhere('trailerPlate', 'LIKE', "%{$pnrQuery}%")
                ->first();
        }

        // Active modal requested via query string (e.g. ?open=reservation, ?open=schedule, ?open=tariffs, ?open=fleet, ?open=pnr)
        $initialModal = $request->get('open', null);
        if ($searchResult || ! empty($pnrQuery)) {
            $initialModal = 'pnr';
        }

        return Inertia::render('landing', compact(
            'voyages',
            'vessels',
            'tariffs',
            'forwarders',
            'categories',
            'pnrQuery',
            'searchResult',
            'initialModal'
        ));
    }
}
