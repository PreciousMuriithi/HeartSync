// HeartSync 2.0 - Flag System
// Made with 💕 for Precious & Safari

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/auth-context';

interface Flag {
    id: string;
    senderId: string;
    value: number;
    customLabel?: string;
    context?: string;
    createdAt: Date;
}

// Default flag meanings (customizable)
const defaultFlagMeanings: Record<number, string> = {
    5: '💚 You made my whole day!',
    4: '💚 So proud of you!',
    3: '💚 That was really sweet!',
    2: '💚 Thank you!',
    1: '💚 Nice one!',
    '-1': '🚩 Small thing to note',
    '-2': '🚩 We should talk',
    '-3': '🚩 I\'m a bit upset',
    '-4': '🚩 This really bothered me',
    '-5': '🚩 We need to discuss this',
};

// Demo flags
const demoFlags: Flag[] = [
    { id: '1', senderId: 'user2', value: 5, createdAt: new Date(Date.now() - 3600000), context: 'For surprising me with coffee!' },
    { id: '2', senderId: 'user1', value: 3, createdAt: new Date(Date.now() - 86400000), context: 'Remembered our anniversary date!' },
];

export default function FlagsPage() {
    const router = useRouter();
    const { user, couple, updateCouple } = useAuth();
    const [flags, setFlags] = useState<Flag[]>(demoFlags);
    const [selectedValue, setSelectedValue] = useState<number | null>(null);
    const [context, setContext] = useState('');
    const [showSendModal, setShowSendModal] = useState(false);

    const handleSendFlag = () => {
        if (selectedValue === null) return;

        const flag: Flag = {
            id: Date.now().toString(),
            senderId: 'user1',
            value: selectedValue,
            context: context.trim() || undefined,
            createdAt: new Date(),
        };

        setFlags([flag, ...flags]);

        // Update trust score (simulation)
        if (couple) {
            const newTrust = Math.max(0, Math.min(100, couple.trustScore + selectedValue));
            updateCouple({ trustScore: newTrust });
        }

        setSelectedValue(null);
        setContext('');
        setShowSendModal(false);
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
                        <h1 className="text-lg font-bold text-text-primary">🚩 Flags</h1>
                        <p className="text-xs text-text-muted">Express how you feel</p>
                    </div>
                    <button onClick={() => setShowSendModal(true)} className="btn-primary px-3 py-2">
                        + Send
                    </button>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-4 py-6">
                {/* Trust Score */}
                <div className="glass-card p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-text-secondary">Trust Score</span>
                        <span className="text-lg font-bold text-trust">
                            {couple?.trustScore || 50}/100
                        </span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${couple?.trustScore || 50}%` }}
                            className="h-full bg-trust"
                        />
                    </div>
                </div>

                {/* Recent Flags */}
                <h2 className="text-sm font-medium text-text-muted mb-3">Recent Flags</h2>

                {flags.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="text-4xl block mb-4">🚩</span>
                        <p className="text-text-muted">No flags yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {flags.map((flag, index) => {
                            const isMine = flag.senderId === 'user1';
                            const isPositive = flag.value > 0;

                            return (
                                <motion.div
                                    key={flag.id}
                                    initial={{ opacity: 0, x: isMine ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`glass-card p-4 ${isMine ? 'ml-8' : 'mr-8'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${isPositive
                                                ? 'bg-flag-positive/20 text-flag-positive'
                                                : 'bg-flag-negative/20 text-flag-negative'
                                            }`}>
                                            {flag.value > 0 ? '+' : ''}{flag.value}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-text-primary">
                                                {defaultFlagMeanings[flag.value]}
                                            </p>
                                            {flag.context && (
                                                <p className="text-xs text-text-secondary mt-1">
                                                    "{flag.context}"
                                                </p>
                                            )}
                                            <p className="text-xs text-text-muted mt-2">
                                                {isMine ? 'You' : 'Partner'} • {formatDistanceToNow(flag.createdAt, { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Send Flag Modal */}
            <AnimatePresence>
                {showSendModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-backdrop"
                        onClick={() => setShowSendModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold text-text-primary mb-4">Send a Flag</h2>

                            {/* Positive Flags */}
                            <div className="mb-4">
                                <p className="text-sm text-text-muted mb-2">Positive 💚</p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(value => (
                                        <button
                                            key={value}
                                            onClick={() => setSelectedValue(value)}
                                            className={`flex-1 py-3 rounded-lg font-bold transition-all ${selectedValue === value
                                                    ? 'bg-flag-positive text-white'
                                                    : 'bg-surface text-flag-positive hover:bg-surface-hover'
                                                }`}
                                        >
                                            +{value}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Negative Flags */}
                            <div className="mb-4">
                                <p className="text-sm text-text-muted mb-2">Negative 🚩</p>
                                <div className="flex gap-2">
                                    {[-1, -2, -3, -4, -5].map(value => (
                                        <button
                                            key={value}
                                            onClick={() => setSelectedValue(value)}
                                            className={`flex-1 py-3 rounded-lg font-bold transition-all ${selectedValue === value
                                                    ? 'bg-flag-negative text-white'
                                                    : 'bg-surface text-flag-negative hover:bg-surface-hover'
                                                }`}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Selected meaning */}
                            {selectedValue !== null && (
                                <div className="mb-4 p-3 bg-surface rounded-lg">
                                    <p className="text-sm text-text-primary">
                                        {defaultFlagMeanings[selectedValue]}
                                    </p>
                                </div>
                            )}

                            {/* Context */}
                            <div className="mb-6">
                                <label className="text-sm text-text-secondary mb-1 block">Context (optional)</label>
                                <input
                                    type="text"
                                    value={context}
                                    onChange={e => setContext(e.target.value)}
                                    placeholder="What's this about?"
                                    className="input"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setShowSendModal(false)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendFlag}
                                    disabled={selectedValue === null}
                                    className="btn-primary flex-1 disabled:opacity-50"
                                >
                                    Send Flag
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
