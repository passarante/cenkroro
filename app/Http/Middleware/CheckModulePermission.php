<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckModulePermission
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $module): Response
    {
        $user = $request->user();

        // Kullanıcı yönetimi sadece oturum açmış yöneticilere açıktır
        if ($module === 'users') {
            if (! $user) {
                return redirect()->route('login');
            }

            if (! $user->isAdmin()) {
                abort(403, 'Kullanıcı ve yetki yönetimi modülüne yalnızca yöneticiler erişebilir.');
            }

            return $next($request);
        }

        // Eğer kullanıcı oturum açmamışsa genel akışa devam et
        if (! $user) {
            return $next($request);
        }

        // Biniş kartı yazdırma izni (Onaylanmış rezervasyonlar saha, acente veya operasyon personeli tarafından yazdırılabilir)
        if ($request->routeIs('bookings.boarding_pass') || $request->is('bookings/boarding-pass/*')) {
            return $next($request);
        }

        // Saha kullanıcısı yalnızca portala erişebilir
        if ($user->isField() && $module !== 'portal') {
            return redirect()->route('portal.index')->with(
                'warning',
                'Saha kullanıcısı yetkisi sadece Sefer Takibi ve Rezervasyon Portalı ile sınırlıdır.'
            );
        }

        // Yönetici tüm modüllere erişebilir
        if ($user->isAdmin()) {
            return $next($request);
        }

        // Operasyon kullanıcısı grup yetkisine göre modüle erişebilir
        if ($user->isOperation()) {
            if (! $user->hasPermission($module)) {
                abort(403, "Bu modüle ({$module}) erişim yetkiniz bulunmamaktadır. Lütfen sistem yöneticiniz ile görüşünüz.");
            }
        }

        return $next($request);
    }
}
