// components/providers/ToastProvider.tsx
'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            expand={true}
            richColors
            closeButton
            duration={4000}
            toastOptions={{
                style: {
                    background: 'white',
                    color: '#0f172a',
                    border: '1px solid #e2e8f0',
                },
                className: 'shadow-lg',
            }}
        />
    );
}
