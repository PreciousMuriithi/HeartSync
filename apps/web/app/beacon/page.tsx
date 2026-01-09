// HeartSync 2.0 - Beacon (Attention Call)
// Made with 💕 for Precious & Safari

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/lib/socket-context';

const beaconTypes = [
    { id: 'miss-you', emoji: '💕', label: 'I miss you', message: 'Thinking of you right now...' },
    { id: 'thinking', emoji: '💭', label: 'Thinking of you', message: 'You just crossed my mind' },
    { id: 'love', emoji: '❤️', label: 'Sending love', message: 'Sending you all my love!' },
    { id: 'hug', emoji: '🤗', label: 'Virtual hug', message: 'Here\'s a big hug for you!' },
    { id: 'kiss', emoji: '😘', label: 'Kiss', message: 'Mwah! 💋' },
    { id: 'call-me', emoji: '📞', label: 'Call me', message: 'Can you call me when you get a chance?' },
    { id: 'urgent', emoji: '🚨', label: 'Need you now', message: 'I really need to talk right now' },
    { id: 'goodnight', emoji: '🌙', label: 'Goodnight', message: 'Sweet dreams, my love 🌙' },
];

export default function BeaconPage() {
    const router = useRouter();
    const { user, partner } = useAuth();
    const { emit, socket, partnerPresence } = useSocket();
    const [sentBeacon, setSentBeacon] = useState<typeof beaconTypes[0] | null>(null);
    const [receivedBeacon, setReceivedBeacon] = useState<typeof beaconTypes[0] | null>(null);
    const [showSentAnimation, setShowSentAnimation] = useState(false);

    // Listen for incoming beacons
    useEffect(() => {
        if (!socket) return;

        const handleBeacon = (data: { type: string }) => {
            const beacon = beaconTypes.find(b => b.id === data.type);
            if (beacon) {
                setReceivedBeacon(beacon);
                // Auto-dismiss after 5 seconds
                setTimeout(() => setReceivedBeacon(null), 5000);
            }
        };

        socket.on('beacon:received', handleBeacon);
        return () => { socket.off('beacon:received', handleBeacon); };
    }, [socket]);

    const sendBeacon = (beacon: typeof beaconTypes[0]) => {
        setSentBeacon(beacon);
        setShowSentAnimation(true);

        // Send via socket
        emit('beacon:send', { type: beacon.id });

        // Clear animation after delay
        setTimeout(() => {
            setShowSentAnimation(false);
            setSentBeacon(null);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-secondary/80 backdrop-blur-md border-b border-white/5 px-4 py-3 safe-top">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <button onClick={() => router.push('/')} className="btn-ghost p-2">
                        ←
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-text-primary">📡 Beacon</h1>
                        <p className="text-xs text-text-muted">Get their attention</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {partner && (
                            <>
                                <span className="text-lg">{partner.avatarEmojis?.[0] || '💕'}</span>
                                <span className={`w-2 h-2 rounded-full ${partnerPresence.isOnline ? 'bg-success' : 'bg-text-muted'
                                    }`} />
                            </>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-4 py-6">
                {/* Partner Status */}
                <div className="glass-card p-4 mb-6 text-center">
                    <span className="text-4xl block mb-2">{partner?.avatarEmojis?.join('') || '💕'}</span>
                    <p className="text-text-primary font-medium">{partner?.nickname || partner?.name || 'Partner'}</p>
                    <p className={`text-sm ${partnerPresence.isOnline ? 'text-success' : 'text-text-muted'}`}>
                        {partnerPresence.isOnline ? '🟢 Online now' : '⚫ Offline'}
                    </p>
                </div>

                {/* Beacon Grid */}
                <h2 className="text-sm font-medium text-text-muted mb-3">Send a beacon</h2>
                <div className="grid grid-cols-2 gap-3">
                    {beaconTypes.map((beacon, index) => (
                        <motion.button
                            key={beacon.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => sendBeacon(beacon)}
                            className="glass-card p-4 flex flex-col items-center gap-2 hover:bg-surface-hover transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="text-3xl">{beacon.emoji}</span>
                            <span className="text-sm font-medium text-text-primary">{beacon.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Sent Animation Overlay */}
            <AnimatePresence>
                {showSentAnimation && sentBeacon && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.5, 1] }}
                            transition={{ duration: 0.5 }}
                            className="text-center"
                        >
                            <motion.span
                                className="text-8xl block"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 10, -10, 0],
                                }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            >
                                {sentBeacon.emoji}
                            </motion.span>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-xl text-text-primary mt-6"
                            >
                                {sentBeacon.message}
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-text-muted mt-2"
                            >
                                Sent to {partner?.nickname || partner?.name || 'your partner'} 💕
                            </motion.p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Received Beacon Notification */}
            <AnimatePresence>
                {receivedBeacon && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-4 left-4 right-4 glass-card p-4 z-40"
                    >
                        <div className="flex items-center gap-4">
                            <motion.span
                                className="text-4xl"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                            >
                                {receivedBeacon.emoji}
                            </motion.span>
                            <div className="flex-1">
                                <p className="font-medium text-text-primary">
                                    {partner?.nickname || partner?.name} sent you a beacon!
                                </p>
                                <p className="text-sm text-text-secondary">{receivedBeacon.message}</p>
                            </div>
                            <button
                                onClick={() => setReceivedBeacon(null)}
                                className="text-text-muted"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
