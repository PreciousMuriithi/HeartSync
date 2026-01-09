// HeartSync 2.0 - Home Page (Main Dashboard)
// Optimized for old Android devices
// Made with 💕 for Precious & Safari

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/lib/socket-context';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const TherapistWidget = dynamic(() => import('@/components/TherapistWidget'), {
    ssr: false,
    loading: () => <div className="mt-6 glass-card p-4 animate-pulse h-32" />,
});

const HeartTap = dynamic(() => import('@/components/HeartTap'), {
    ssr: false,
    loading: () => (
        <div className="stat-card">
            <span className="text-3xl">❤️</span>
            <span className="text-2xl font-bold text-hearts">0</span>
            <span className="text-xs text-text-muted">Hearts</span>
        </div>
    ),
});

export default function HomePage() {
    const { isLoading, isAuthenticated, user, partner, couple, updateCouple } = useAuth();
    const { isConnected, partnerPresence } = useSocket();
    const router = useRouter();
    const [hearts, setHearts] = useState(couple?.hearts || 0);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (couple) {
            setHearts(couple.hearts);
        }
    }, [couple]);

    const handleHeartsUpdated = useCallback((newTotal: number) => {
        setHearts(newTotal);
        if (updateCouple) {
            updateCouple({ hearts: newTotal });
        }
    }, [updateCouple]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-6xl animate-pulse">💕</div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <main className="min-h-screen bg-background safe-top safe-bottom pb-20">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-secondary/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">💕</span>
                        <span className="font-bold text-lg text-text-primary">HeartSync</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {partner && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-lg">{partner.avatarEmojis?.[0] || '💕'}</span>
                                <span className={`w-2 h-2 rounded-full ${partnerPresence.isOnline ? 'bg-success' : 'bg-text-muted'
                                    }`} />
                            </div>
                        )}
                        <Link href="/settings" className="btn-ghost p-2">⚙️</Link>
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="max-w-lg mx-auto px-4 py-6">
                <div className="grid grid-cols-3 gap-3">
                    {/* Hearts - Clickable */}
                    <HeartTap
                        totalHearts={hearts}
                        onHeartsUpdated={handleHeartsUpdated}
                    />

                    {/* Trust Score */}
                    <div className="stat-card">
                        <span className="text-3xl">🛡️</span>
                        <span className="text-2xl font-bold text-trust">{couple?.trustScore || 50}</span>
                        <span className="text-xs text-text-muted">Trust</span>
                    </div>

                    {/* Streak */}
                    <div className="stat-card">
                        <span className="text-3xl">🔥</span>
                        <span className="text-2xl font-bold text-streak">{couple?.streak || 0}</span>
                        <span className="text-xs text-text-muted">Streak</span>
                    </div>
                </div>

                {/* Users Display */}
                <div className="mt-6 glass-card p-4 flex items-center justify-around">
                    {/* User */}
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-3xl">{user.avatarEmojis?.join('') || '💕'}</span>
                        <span className="text-sm font-medium text-text-primary">
                            {user.nickname || user.name}
                        </span>
                    </div>

                    <span className="text-4xl">💕</span>

                    {/* Partner */}
                    {partner ? (
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-3xl">{partner.avatarEmojis?.join('') || '💕'}</span>
                            <span className="text-sm font-medium text-text-primary">
                                {partner.nickname || partner.name}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1 opacity-50">
                            <span className="text-3xl">❓</span>
                            <span className="text-sm text-text-muted">Waiting...</span>
                        </div>
                    )}
                </div>

                {/* Dr. Harmony Widget */}
                <TherapistWidget
                    hearts={hearts}
                    trustScore={couple?.trustScore || 50}
                    streak={couple?.streak || 0}
                />

                {/* Quick Actions */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                    <Link href="/chat" className="btn-primary text-center flex items-center justify-center gap-2">
                        💬 Chat
                    </Link>
                    <Link href="/therapist" className="btn-secondary text-center flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500/20 to-purple-600/20 border-pink-500/30">
                        🌸 Dr. Harmony
                    </Link>
                </div>

                {/* Main Menu Grid */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                    <MenuCard href="/letters" icon="💌" label="Letters" />
                    <MenuCard href="/flags" icon="🚩" label="Flags" />
                    <MenuCard href="/memories" icon="📸" label="Memories" />
                    <MenuCard href="/calendar" icon="📅" label="Calendar" />
                    <MenuCard href="/store" icon="🎁" label="Store" />
                    <MenuCard href="/games" icon="🎮" label="Games" />
                    <MenuCard href="/beacon" icon="📡" label="Beacon" />
                </div>

                {/* Typing Indicator */}
                {partnerPresence.isTyping && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-text-muted text-sm">
                        <span>{partner?.nickname || partner?.name} is typing</span>
                        <span className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </span>
                    </div>
                )}
            </div>

            {/* Connection Status - Subtle */}
            {!isConnected && (
                <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto">
                    <div className="bg-surface/90 backdrop-blur border border-white/10 rounded-lg px-4 py-2 text-xs text-text-muted text-center flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                        Connecting...
                    </div>
                </div>
            )}
        </main>
    );
}

// Simplified menu card without framer-motion for performance
function MenuCard({ href, icon, label }: { href: string; icon: string; label: string }) {
    return (
        <Link
            href={href}
            className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-surface-hover transition-colors active:scale-95"
        >
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-medium text-text-secondary">{label}</span>
        </Link>
    );
}
