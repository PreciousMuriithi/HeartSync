// HeartSync 2.0 - Providers (tRPC, React Query, etc.)
// Made with 💕 for Precious & Safari

'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '@/lib/trpc';
import { AuthProvider } from '@/lib/auth-context';
import { SocketProvider } from '@/lib/socket-context';
import { ThemeProvider } from '@/lib/theme-context';

function getBaseUrl() {
    if (typeof window !== 'undefined') {
        // Browser should use relative path
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    }
    // SSR should use localhost
    return process.env.API_URL || 'http://localhost:3001';
}

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60, // 1 minute
                retry: 1,
            },
        },
    }));

    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: `${getBaseUrl()}/trpc`,
                    headers() {
                        const token = typeof window !== 'undefined'
                            ? localStorage.getItem('heartsync_token')
                            : null;
                        return token ? { Authorization: `Bearer ${token}` } : {};
                    },
                }),
            ],
        })
    );

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <AuthProvider>
                        <SocketProvider>
                            {children}
                        </SocketProvider>
                    </AuthProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </trpc.Provider>
    );
}
