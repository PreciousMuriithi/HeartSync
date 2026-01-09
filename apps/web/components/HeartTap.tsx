// HeartSync 2.0 - Heart Tap Component
// Clickable heart counter with tap sessions and partner notifications
// Made with 💕 for Precious & Safari

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/lib/socket-context';

interface HeartParticle {
    id: number;
    x: number;
    y: number;
}

interface HeartTapProps {
    totalHearts: number;
    onHeartsUpdated?: (newTotal: number) => void;
}

export default function HeartTap({ totalHearts, onHeartsUpdated }: HeartTapProps) {
    const { user, partner, couple, updateCouple } = useAuth();
    const { socket, isConnected } = useSocket();

    const [tapCount, setTapCount] = useState(0);
    const [isTapping, setIsTapping] = useState(false);
    const [particles, setParticles] = useState<HeartParticle[]>([]);
    const [showSendButton, setShowSendButton] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [lastReceived, setLastReceived] = useState<{ from: string; count: number } | null>(null);

    const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const particleIdRef = useRef(0);
    const heartRef = useRef<HTMLButtonElement>(null);

    // Listen for received hearts
    useEffect(() => {
        if (!socket) return;

        const handleHeartsReceived = (data: { fromName: string; count: number; newTotal: number }) => {
            setLastReceived({ from: data.fromName, count: data.count });
            onHeartsUpdated?.(data.newTotal);

            // Clear notification after 3 seconds
            setTimeout(() => setLastReceived(null), 3000);
        };

        socket.on('hearts:received', handleHeartsReceived);
        return () => { socket.off('hearts:received', handleHeartsReceived); };
    }, [socket, onHeartsUpdated]);

    // Handle heart tap
    const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();

        // Increment tap count
        setTapCount(prev => prev + 1);
        setIsTapping(true);
        setShowSendButton(true);

        // Add particle
        const rect = heartRef.current?.getBoundingClientRect();
        if (rect) {
            const x = Math.random() * 60 - 30; // Random spread
            const y = -20 - Math.random() * 30; // Float upward
            setParticles(prev => [...prev, { id: particleIdRef.current++, x, y }]);

            // Remove particle after animation
            setTimeout(() => {
                setParticles(prev => prev.slice(1));
            }, 1000);
        }

        // Reset tapping state after short delay
        setTimeout(() => setIsTapping(false), 100);

        // Clear existing timeout and set new one
        if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current);
        }

        // Auto-show send prompt after 2 seconds of no tapping
        tapTimeoutRef.current = setTimeout(() => {
            // Keep showing send button
        }, 2000);
    }, []);

    // Send hearts to partner
    const sendHearts = async () => {
        if (tapCount === 0 || isSending) return;

        setIsSending(true);

        try {
            const token = sessionStorage.getItem('heartsync_token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/hearts/tap`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ count: tapCount }),
            });

            if (response.ok) {
                const data = await response.json();
                onHeartsUpdated?.(data.newTotal);

                // Reset
                setTapCount(0);
                setShowSendButton(false);
            }
        } catch (error) {
            console.error('Failed to send hearts:', error);
        } finally {
            setIsSending(false);
        }
    };

    // Cancel and reset
    const cancelTap = () => {
        setTapCount(0);
        setShowSendButton(false);
        if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current);
        }
    };

    const partnerName = partner?.nickname || partner?.name || 'Partner';

    return (
        <div className="relative">
            {/* Main Heart Counter */}
            <motion.button
                ref={heartRef}
                onClick={handleTap}
                className="stat-card relative cursor-pointer select-none touch-none active:scale-95 transition-transform"
                whileTap={{ scale: 0.9 }}
            >
                {/* Heart emoji with pulse */}
                <motion.span
                    className="text-3xl"
                    animate={isTapping ? { scale: [1, 1.3, 1] } : { scale: [1, 1.05, 1] }}
                    transition={isTapping ? { duration: 0.15 } : { repeat: Infinity, duration: 1.5 }}
                >
                    ❤️
                </motion.span>

                {/* Current total + tap count */}
                <span className="text-2xl font-bold text-hearts">
                    {totalHearts}
                    {tapCount > 0 && (
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-primary ml-1"
                        >
                            +{tapCount}
                        </motion.span>
                    )}
                </span>
                <span className="text-xs text-text-muted">
                    {tapCount > 0 ? 'Tap to add more!' : 'Tap to send hearts'}
                </span>

                {/* Floating particles */}
                <AnimatePresence>
                    {particles.map(particle => (
                        <motion.span
                            key={particle.id}
                            initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                            animate={{
                                opacity: 0,
                                x: particle.x,
                                y: particle.y - 50,
                                scale: 1,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="absolute text-xl pointer-events-none"
                            style={{ left: '50%', top: '30%' }}
                        >
                            💕
                        </motion.span>
                    ))}
                </AnimatePresence>
            </motion.button>

            {/* Send Button Overlay */}
            <AnimatePresence>
                {showSendButton && tapCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-2 z-10"
                    >
                        <motion.button
                            onClick={cancelTap}
                            className="px-3 py-1.5 bg-surface border border-white/10 rounded-full text-xs text-text-muted hover:bg-surface-hover"
                            whileTap={{ scale: 0.95 }}
                        >
                            ✕
                        </motion.button>
                        <motion.button
                            onClick={sendHearts}
                            disabled={isSending}
                            className="px-4 py-1.5 bg-primary rounded-full text-xs text-white font-medium flex items-center gap-1 disabled:opacity-50"
                            whileTap={{ scale: 0.95 }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            {isSending ? (
                                '...'
                            ) : (
                                <>
                                    Send {tapCount} ❤️ to {partnerName}
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Received Hearts Notification */}
            <AnimatePresence>
                {lastReceived && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        className="absolute -top-16 left-1/2 -translate-x-1/2 bg-primary/90 backdrop-blur px-4 py-2 rounded-full text-white text-sm font-medium whitespace-nowrap z-20"
                    >
                        💕 {lastReceived.from} sent {lastReceived.count} heart{lastReceived.count > 1 ? 's' : ''}!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
