'use client';

import { SessionProvider } from 'next-auth/react';
import { HeroUIProvider } from '@heroui/react';
import { ToastProvider } from '@heroui/toast';

export function Providers({children}: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <HeroUIProvider locale='th-TH'>
                <ToastProvider placement='top-right'/>
                {children}
            </HeroUIProvider>
        </SessionProvider>
    );
}