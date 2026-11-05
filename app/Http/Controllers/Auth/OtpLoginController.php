<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpCodeMail;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OtpLoginController extends Controller
{
    /**
     * Show OTP Login page (also embedded in main login).
     */
    public function show(Request $request): Response
    {
        $redirectUrl = $request->query('redirect', '/portal');
        $voyageId = $request->query('voyageId');

        if ($redirectUrl) {
            $request->session()->put('otp_redirect', $redirectUrl);
        }
        if ($voyageId) {
            $request->session()->put('otp_voyage_id', $voyageId);
        }

        return Inertia::render('auth/login', [
            'initialTab' => 'otp',
            'redirectUrl' => $redirectUrl,
            'voyageId' => $voyageId,
            'otpSentTo' => $request->session()->get('otp_sent_to'),
            'otpCodeDemo' => $request->session()->get('otp_code_demo'),
            'canResetPassword' => false,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Send OTP code to user's email.
     */
    public function sendOtp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|string|max:255',
        ]);

        $email = strtolower(trim($validated['email']));

        $user = User::where('email', $email)->first();

        // Saha kullanıcısı otomatik olarak ilk e-posta girişinde oluşturulabilir
        if (! $user) {
            $user = User::create([
                'email' => $email,
                'name' => explode('@', $email)[0],
                'role' => 'field',
                'status' => 'active',
            ]);
        }

        if (! $user->isActive()) {
            throw ValidationException::withMessages([
                'email' => 'Hesabınız pasife alınmıştır. Lütfen sistem yöneticiniz ile iletişime geçiniz.',
            ]);
        }

        // 6 Haneli rastgele OTP kodu üret
        $code = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        $user->forceFill([
            'otp_code' => $code,
            'otp_expires_at' => now()->addMinutes(10),
        ])->save();

        Log::info("OTP Gönderildi: [{$email}] Kod: [{$code}]");

        // Gerçek SMTP üzerinden e-posta gönderimi
        try {
            Mail::to($email)->send(new OtpCodeMail($code, $user->name));
        } catch (\Throwable $e) {
            Log::error('OTP Mail gönderim hatası: '.$e->getMessage());
        }

        return back()
            ->with('otp_sent_to', $email)
            ->with('otp_code_demo', $code)
            ->with('success', "Doğrulama kodunuz {$email} adresine gönderildi!");
    }

    /**
     * Verify OTP and authenticate user.
     */
    public function verifyOtp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|string',
            'otp_code' => 'required|string|size:6',
        ]);

        $email = strtolower(trim($validated['email']));
        $user = User::where('email', $email)->first();

        if (! $user || ! $user->isActive()) {
            throw ValidationException::withMessages([
                'otp_code' => 'Geçersiz kullanıcı veya hesap pasif durumda.',
            ]);
        }

        if (! $user->otp_code || $user->otp_code !== $validated['otp_code']) {
            throw ValidationException::withMessages([
                'otp_code' => 'Girdiğiniz 6 haneli doğrulama kodu hatalıdır.',
            ]);
        }

        if (! $user->otp_expires_at || $user->otp_expires_at->isPast()) {
            throw ValidationException::withMessages([
                'otp_code' => 'Doğrulama kodunun süresi dolmuştur (10 dakika). Lütfen tekrar kod isteyiniz.',
            ]);
        }

        // Kodu sıfırla ve oturum aç
        $user->forceFill([
            'otp_code' => null,
            'otp_expires_at' => null,
        ])->save();

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        $defaultRedirect = $user->isField()
            ? route('portal.index', absolute: false)
            : route('dashboard', absolute: false);

        $redirectUrl = $request->session()->pull('otp_redirect', $defaultRedirect);
        $voyageId = $request->session()->pull('otp_voyage_id');

        if ($voyageId) {
            $redirectUrl = route('portal.index', ['tab' => 'book', 'voyageId' => $voyageId], absolute: false);
        }

        return redirect()->intended($redirectUrl)
            ->with('success', "Hoş geldiniz, {$user->name}!");
    }
}
