<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
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
        return Inertia::render('auth/login', [
            'initialTab' => 'otp',
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

        Log::info("Saha Kullanıcısı OTP Gönderildi: [{$email}] Kod: [{$code}]");

        // E-posta gönderimi simülasyonu / hazırlığı
        try {
            // İleride SMTP ayarı yapıldığında direkt gider:
            // Mail::raw("Cenk Ro-Ro Saha Giriş Doğrulama Kodunuz: {$code}\nBu kod 10 dakika geçerlidir.", function ($m) use ($email) {
            //     $m->to($email)->subject('Cenk Ro-Ro Saha Giriş Kodu');
            // });
        } catch (\Throwable $e) {
            Log::warning('OTP Mail gönderim hatası: '.$e->getMessage());
        }

        return back()
            ->with('otp_sent_to', $email)
            ->with('otp_code_demo', $code)
            ->with('success', "Doğrulama kodunuz {$email} adresine gönderildi! (Test Kodu: {$code})");
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

        if ($user->isField()) {
            return redirect()->intended(route('portal.index', absolute: false))
                ->with('success', "Hoş geldiniz, {$user->name}! Saha portali kullanımınıza hazırdır.");
        }

        return redirect()->intended(route('dashboard', absolute: false))
            ->with('success', "Hoş geldiniz, {$user->name}!");
    }
}
