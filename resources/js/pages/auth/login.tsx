import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, KeyRound, LoaderCircle, Mail, ShieldCheck, Smartphone } from 'lucide-react';
import React, { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { SharedData } from '@/types';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
    initialTab?: 'password' | 'otp';
    otpSentTo?: string;
    otpCodeDemo?: string;
}

export default function Login({
    status,
    canResetPassword = false,
    initialTab = 'password',
    otpSentTo,
    otpCodeDemo,
}: LoginProps) {
    const isOtp = initialTab === 'otp';

    // Standard Password Login Form
    const passwordForm = useForm<LoginForm>({
        email: '',
        password: '',
        remember: true,
    });

    // OTP Request Form (Step 1)
    const otpRequestForm = useForm({
        email: otpSentTo || '',
    });

    // OTP Verify Form (Step 2)
    const [isOtpSent, setIsOtpSent] = useState(!!otpSentTo);
    const [sentEmail, setSentEmail] = useState(otpSentTo || '');
    const [demoCode, setDemoCode] = useState(otpCodeDemo || '');

    const otpVerifyForm = useForm({
        email: otpSentTo || '',
        otp_code: '',
    });

    const submitPasswordLogin: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.post(route('login'), {
            onFinish: () => passwordForm.reset('password'),
        });
    };

    const submitOtpRequest: FormEventHandler = (e) => {
        e.preventDefault();
        otpRequestForm.post(route('otp.send'), {
            onSuccess: () => {
                const mail = otpRequestForm.data.email;
                setSentEmail(mail);
                otpVerifyForm.setData('email', mail);
                setIsOtpSent(true);
            },
        });
    };

    const submitOtpVerify: FormEventHandler = (e) => {
        e.preventDefault();
        otpVerifyForm.post(route('otp.verify'));
    };

    return (
        <AuthLayout
            title={isOtp ? 'Cenk Ro-Ro Rezervasyon Girişi' : 'Cenk Ro-Ro Platform Girişi'}
            description={
                isOtp
                    ? 'E-posta adresinize gönderilecek tek kullanımlık kod (OTP) ile hızlı giriş yapın.'
                    : 'Yönetici ve operasyon personeli için e-posta ve şifre ile yetkili giriş.'
            }
        >
            <Head title={isOtp ? 'Rezervasyon Girişi (OTP)' : 'Platform Girişi'} />

            {/* 1. OTP İLE HIZLI REZERVASYON GİRİŞİ */}
            {isOtp ? (
                <div className="flex flex-col gap-5">
                    {!isOtpSent ? (
                        /* STEP 1: Enter Email to receive OTP */
                        <form onSubmit={submitOtpRequest} className="space-y-4">
                            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-3.5 text-xs text-amber-900 dark:text-amber-200">
                                <p className="font-semibold flex items-center gap-1.5 mb-1 text-amber-800 dark:text-amber-300">
                                    <KeyRound className="h-4 w-4 text-amber-600" />
                                    Tek Kullanımlık Kod ile Doğrulama (OTP)
                                </p>
                                <p className="leading-relaxed">
                                    Şifre belirlemenize gerek yoktur. E-posta adresinize 6 haneli tek kullanımlık bir giriş kodu (OTP) gönderilecektir.
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="otp_email">E-posta Adresi</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="otp_email"
                                        type="email"
                                        required
                                        autoFocus
                                        value={otpRequestForm.data.email}
                                        onChange={(e) => otpRequestForm.setData('email', e.target.value)}
                                        placeholder="ornek@sirketiniz.com"
                                        className="pl-9"
                                    />
                                </div>
                                <InputError message={otpRequestForm.errors.email} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold h-10 shadow-sm"
                                disabled={otpRequestForm.processing}
                            >
                                {otpRequestForm.processing ? (
                                    <>
                                        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                        Kod Gönderiliyor...
                                    </>
                                ) : (
                                    <>
                                        <Smartphone className="h-4 w-4 mr-2" />
                                        Giriş Kodu (OTP) Gönder
                                    </>
                                )}
                            </Button>
                            <div className="pt-2 text-center border-t border-border/60">
                                <Link
                                    href={route('login')}
                                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                                >
                                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                                    <span>Yönetici & Operasyon Platform Girişi (Şifre ile) →</span>
                                </Link>
                            </div>
                        </form>
                    ) : (
                        /* STEP 2: Enter 6-digit OTP code */
                        <form onSubmit={submitOtpVerify} className="space-y-4">
                            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-3.5 text-xs text-emerald-900 dark:text-emerald-200">
                                <div className="flex items-center gap-1.5 font-semibold mb-1 text-emerald-800 dark:text-emerald-300">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    Doğrulama Kodu Gönderildi
                                </div>
                                <p className="leading-relaxed">
                                    <strong>{sentEmail}</strong> adresine 6 haneli giriş kodu iletildi. Lütfen kodu aşağıdaki alana giriniz.
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="otp_code">6 Haneli Doğrulama Kodu (OTP)</Label>
                                <Input
                                    id="otp_code"
                                    type="text"
                                    required
                                    autoFocus
                                    maxLength={6}
                                    value={otpVerifyForm.data.otp_code}
                                    onChange={(e) => otpVerifyForm.setData('otp_code', e.target.value.replace(/\D/g, ''))}
                                    placeholder="123456"
                                    className="text-center text-xl font-bold tracking-widest h-12"
                                />
                                <InputError message={otpVerifyForm.errors.otp_code} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-10 shadow-sm"
                                disabled={otpVerifyForm.processing}
                            >
                                {otpVerifyForm.processing ? (
                                    <>
                                        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                        Doğrulanıyor...
                                    </>
                                ) : (
                                    'Kodu Onayla ve Giriş Yap'
                                )}
                            </Button>

                            <div className="flex items-center justify-between text-xs pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsOtpSent(false)}
                                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Farklı e-posta kullan
                                </button>

                                <button
                                    type="button"
                                    onClick={submitOtpRequest}
                                    className="text-primary hover:underline font-medium cursor-pointer"
                                >
                                    Tekrar kod gönder
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            ) : (
                /* 2. YÖNETİCİ & OPERASYON PLATFORM GİRİŞİ (ŞİFRE İLE) */
                <form className="flex flex-col gap-5" onSubmit={submitPasswordLogin}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-posta Adresi</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={passwordForm.data.email}
                                onChange={(e) => passwordForm.setData('email', e.target.value)}
                                placeholder="ornek@cenkroro.com"
                            />
                            <InputError message={passwordForm.errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Şifre</Label>
                                {canResetPassword && (
                                    <TextLink href={route('password.request')} className="ml-auto text-xs" tabIndex={5}>
                                        Şifremi Unuttum
                                    </TextLink>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                placeholder="••••••••"
                            />
                            <InputError message={passwordForm.errors.password} />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                                checked={passwordForm.data.remember}
                                onCheckedChange={(val) => passwordForm.setData('remember', !!val)}
                            />
                            <Label htmlFor="remember" className="text-xs font-normal cursor-pointer">
                                Beni hatırla
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 shadow-sm"
                            tabIndex={4}
                            disabled={passwordForm.processing}
                        >
                            {passwordForm.processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                            Platforma Giriş Yap
                        </Button>
                    </div>
                    <div className="pt-2 text-center border-t border-border/60">
                        <Link
                            href={route('otp.login')}
                            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                        >
                            <Smartphone className="h-4 w-4 text-amber-600" />
                            <span>Online Rezervasyon Yapmak İçin (OTP ile Giriş) →</span>
                        </Link>
                    </div>
                </form>
            )}

            {status && <div className="mt-4 text-center text-xs font-medium text-emerald-600">{status}</div>}
        </AuthLayout>
    );
}
