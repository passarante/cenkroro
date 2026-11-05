import { Link } from '@inertiajs/react';
import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div
            className="relative min-h-svh w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 bg-cover bg-center bg-no-repeat selection:bg-sky-500 selection:text-white"
            style={{
                backgroundImage: `linear-gradient(rgba(5, 38, 75, 0.84), rgba(2, 23, 48, 0.92)), url('/img/slide1.png'), url('/images/cenk_hero.jpg')`,
            }}
        >
            <div className="relative z-10 w-full max-w-md">
                <div className="rounded-2xl bg-white dark:bg-slate-900/95 shadow-2xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 flex flex-col gap-6 text-slate-900 dark:text-slate-100">
                    <div className="flex flex-col items-center gap-3.5 text-center">
                        <Link
                            href={route('home')}
                            className="group flex items-center justify-center py-2.5 px-6 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:scale-102 transition-all cursor-pointer"
                            title="Cenk Ro-Ro Ana Sayfa"
                        >
                            <img
                                src="/img/logo.png"
                                alt="CENK RORO"
                                className="h-8 w-auto max-w-[210px] object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </Link>

                        <div className="space-y-1.5">
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-xs mx-auto">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}

