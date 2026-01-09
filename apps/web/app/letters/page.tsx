// HeartSync 2.0 - Love Letters
// Made with 💕 for Precious & Safari

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/auth-context';

interface Letter {
    id: string;
    senderId: string;
    content: string;
    createdAt: Date;
    isRead: boolean;
}

// Demo letters
const demoLetters: Letter[] = [
    {
        id: '1',
        senderId: 'user2',
        content: `Mi amor 💕

Every day with you feels like a beautiful dream I never want to wake up from. You make my heart flutter in ways I never knew were possible.

Thank you for being you.

Forever yours,
Safari 🖤`,
        createdAt: new Date(Date.now() - 86400000 * 2),
        isRead: true,
    },
    {
        id: '2',
        senderId: 'user1',
        content: `My dearest Safari 🌹

I can't stop thinking about you. Your smile lights up my whole world, and your love makes every day worth living.

You are my favorite person in this entire universe.

With all my heart,
Tavi 🧚`,
        createdAt: new Date(Date.now() - 86400000 * 5),
        isRead: true,
    },
];

export default function LettersPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [letters, setLetters] = useState<Letter[]>(demoLetters);
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
    const [newContent, setNewContent] = useState('');

    const handleSendLetter = () => {
        if (!newContent.trim()) return;

        const letter: Letter = {
            id: Date.now().toString(),
            senderId: 'user1',
            content: newContent,
            createdAt: new Date(),
            isRead: false,
        };

        setLetters([letter, ...letters]);
        setNewContent('');
        setShowComposeModal(false);
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
                        <h1 className="text-lg font-bold text-text-primary">💌 Love Letters</h1>
                        <p className="text-xs text-text-muted">Heartfelt messages</p>
                    </div>
                    <button onClick={() => setShowComposeModal(true)} className="btn-primary px-3 py-2">
                        ✍️ Write
                    </button>
                </div>
            </header>

            {/* Letters List */}
            <div className="max-w-lg mx-auto px-4 py-6">
                {letters.length === 0 ? (
                    <div className="text-center py-16">
                        <span className="text-6xl block mb-4">💌</span>
                        <p className="text-text-muted">No letters yet</p>
                        <p className="text-text-muted text-sm">Write your first love letter</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {letters.map((letter, index) => {
                            const isMine = letter.senderId === 'user1';

                            return (
                                <motion.button
                                    key={letter.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setSelectedLetter(letter)}
                                    className="w-full glass-card p-4 text-left hover:bg-surface-hover transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{isMine ? '📤' : '📥'}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-text-primary">
                                                    {isMine ? 'Sent' : 'Received'}
                                                </span>
                                                {!letter.isRead && !isMine && (
                                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                                )}
                                            </div>
                                            <p className="text-sm text-text-secondary line-clamp-2">
                                                {letter.content.substring(0, 100)}...
                                            </p>
                                            <p className="text-xs text-text-muted mt-2">
                                                {formatDistanceToNow(letter.createdAt, { addSuffix: true })}
                                            </p>
                                        </div>
                                        <span className="text-text-muted">→</span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* View Letter Modal */}
            <AnimatePresence>
                {selectedLetter && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-backdrop"
                        onClick={() => setSelectedLetter(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content max-w-lg"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">💌</span>
                                    <span className="text-text-muted text-sm">
                                        {format(selectedLetter.createdAt, 'MMMM d, yyyy')}
                                    </span>
                                </div>
                                <button onClick={() => setSelectedLetter(null)} className="btn-ghost p-1">
                                    ✕
                                </button>
                            </div>

                            <div className="bg-surface rounded-xl p-6 border border-white/5">
                                <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
                                    {selectedLetter.content}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Compose Modal */}
            <AnimatePresence>
                {showComposeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-backdrop"
                        onClick={() => setShowComposeModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content max-w-lg"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold text-text-primary mb-4">✍️ Write a Love Letter</h2>

                            <textarea
                                value={newContent}
                                onChange={e => setNewContent(e.target.value)}
                                placeholder="Pour your heart out..."
                                rows={10}
                                className="input resize-none mb-4"
                            />

                            <div className="flex gap-3">
                                <button onClick={() => setShowComposeModal(false)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button onClick={handleSendLetter} className="btn-primary flex-1">
                                    💌 Send Letter
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
