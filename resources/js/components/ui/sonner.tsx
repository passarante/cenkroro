import { useAppearance } from '@/hooks/use-appearance';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast, Toaster as Sonner, type ToasterProps } from 'sonner';
import { type SharedData } from '@/types';

const Toaster = ({ ...props }: ToasterProps) => {
    const { appearance } = useAppearance();
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (!flash) return;

        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
        if (flash.info) {
            toast.info(flash.info);
        }
        if (flash.warning) {
            toast.warning(flash.warning);
        }
    }, [flash]);

    return (
        <Sonner
            theme={appearance as ToasterProps['theme']}
            className="toaster group"
            richColors
            closeButton
            position="top-right"
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                    description: 'group-[.toast]:text-muted-foreground',
                    actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                    cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                },
            }}
            {...props}
        />
    );
};

export { Toaster, toast };
