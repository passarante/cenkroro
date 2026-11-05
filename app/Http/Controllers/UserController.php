<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(): Response
    {
        $users = User::orderBy('id', 'desc')->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'status' => $u->status,
                'permissions_json' => $u->permissions_json ?? [],
                'phone' => $u->phone,
                'company_name' => $u->company_name,
                'created_at' => $u->created_at?->format('d.m.Y H:i'),
            ];
        });

        return Inertia::render('users/index', [
            'users' => $users,
            'modules' => User::MODULES,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'role' => ['required', Rule::in(['admin', 'operation', 'field'])],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:50',
            'company_name' => 'nullable|string|max:255',
            'permissions_json' => 'nullable|array',
        ]);

        if ($validated['role'] !== 'field' && empty($validated['password'])) {
            return back()->withErrors(['password' => 'Yönetici ve Operasyon kullanıcıları için şifre zorunludur.']);
        }

        $permissions = [];
        if ($validated['role'] === 'admin') {
            $permissions = array_keys(User::MODULES);
        } elseif ($validated['role'] === 'operation') {
            $permissions = $validated['permissions_json'] ?? ['dashboard', 'voyages', 'bookings'];
        }

        User::create([
            'name' => $validated['name'],
            'email' => strtolower(trim($validated['email'])),
            'password' => ! empty($validated['password']) ? $validated['password'] : null,
            'role' => $validated['role'],
            'status' => $validated['status'],
            'permissions_json' => $permissions,
            'phone' => $validated['phone'] ?? null,
            'company_name' => $validated['company_name'] ?? null,
        ]);

        return redirect()->route('users.index')
            ->with('success', "{$validated['name']} kullanıcısı başarıyla oluşturuldu.");
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', Rule::in(['admin', 'operation', 'field'])],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:50',
            'company_name' => 'nullable|string|max:255',
            'permissions_json' => 'nullable|array',
        ]);

        // Kendini pasife alma koruması
        if ($user->id === Auth::id() && $validated['status'] === 'inactive') {
            return back()->withErrors(['status' => 'Kendi hesabınızı pasife alamazsınız.']);
        }

        $permissions = [];
        if ($validated['role'] === 'admin') {
            $permissions = array_keys(User::MODULES);
        } elseif ($validated['role'] === 'operation') {
            $permissions = $validated['permissions_json'] ?? [];
        }

        $updateData = [
            'name' => $validated['name'],
            'email' => strtolower(trim($validated['email'])),
            'role' => $validated['role'],
            'status' => $validated['status'],
            'permissions_json' => $permissions,
            'phone' => $validated['phone'] ?? null,
            'company_name' => $validated['company_name'] ?? null,
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = $validated['password'];
        }

        $user->update($updateData);

        return redirect()->route('users.index')
            ->with('success', "{$user->name} kullanıcısı başarıyla güncellendi.");
    }

    /**
     * Toggle active/inactive status.
     */
    public function toggleStatus(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            return back()->withErrors(['status' => 'Kendi hesabınızı pasife alamazsınız.']);
        }

        $newStatus = $user->status === 'active' ? 'inactive' : 'active';
        $user->update(['status' => $newStatus]);

        $statusText = $newStatus === 'active' ? 'aktife' : 'pasife';

        return redirect()->route('users.index')
            ->with('success', "{$user->name} kullanıcısı {$statusText} alındı.");
    }

    /**
     * Remove the specified user.
     */
    public function destroy(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            return back()->withErrors(['error' => 'Kendi hesabınızı silemezsiniz.']);
        }

        $name = $user->name;
        $user->delete();

        return redirect()->route('users.index')
            ->with('success', "{$name} kullanıcısı sistemden silindi.");
    }
}
