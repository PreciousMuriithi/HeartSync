// HeartSync 2.0 - Memory Lane (Photo Journal)
// Made with 💕 for Precious & Safari

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/auth-context';

interface Memory {
    id: string;
    title: string;
    description: string;
    date: Date;
    emoji: string;
    imageUrl?: string;
}

// Demo memories
const demoMemories: Memory[] = [
    {
        id: '1',
        title: 'First Date 💕',
        description: 'The day we first met and everything changed...',
        date: new Date('2024-02-14'),
        emoji: '💕',
    },
    {
        id: '2',
        title: 'Movie Night 🎬',
        description: 'Watched our favorite horror movie together',
        date: new Date('2024-06-20'),
        emoji: '🎬',
    },
    {
        id: '3',
        title: 'Beach Sunset 🌅',
        description: 'That perfect sunset we watched together',
        date: new Date('2024-08-15'),
        emoji: '🌅',
    },
];

export default function MemoriesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [memories, setMemories] = useState<Memory[]>(demoMemories);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newMemory, setNewMemory] = useState({ title: '', description: '', emoji: '💕' });

    const emojiOptions = ['💕', '🌹', '🎬', '🌅', '🎉', '🎂', '✈️', '🏠', '💍', '🎁', '📸', '🌙'];

    const handleAddMemory = () => {
        if (!newMemory.title.trim()) return;

        const memory: Memory = {
            id: Date.now().toString(),
            title: newMemory.title,
            description: newMemory.description,
            date: new Date(),
            emoji: newMemory.emoji,
        };

        setMemories([memory, ...memories]);
        setNewMemory({ title: '', description: '', emoji: '💕' });
        setShowAddModal(false);
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
                        <h1 className="text-lg font-bold text-text-primary">📸 Memory Lane</h1>
                        <p className="text-xs text-text-muted">Your shared moments</p>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="btn-primary px-3 py-2">
                        + Add
                    </button>
                </div>
            </header>

            {/* Memories Grid */}
            <div className="max-w-lg mx-auto px-4 py-6">
                {memories.length === 0 ? (
                    <div className="text-center py-16">
                        <span className="text-6xl block mb-4">📸</span>
                        <p className="text-text-muted">No memories yet</p>
                        <p className="text-text-muted text-sm">Start capturing your special moments</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {memories.map((memory, index) => (
                            <motion.div
                                key={memory.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-3xl">{memory.emoji}</span>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-text-primary">{memory.title}</h3>
                                        <p className="text-sm text-text-secondary mt-1">{memory.description}</p>
                                        <p className="text-xs text-text-muted mt-2">
                                            {format(memory.date, 'MMMM d, yyyy')} • {formatDistanceToNow(memory.date, { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Memory Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-backdrop"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold text-text-primary mb-4">Add Memory</h2>

                            {/* Emoji Selector */}
                            <div className="mb-4">
                                <label className="text-sm text-text-secondary mb-2 block">Pick an emoji</label>
                                <div className="flex flex-wrap gap-2">
                                    {emojiOptions.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => setNewMemory({ ...newMemory, emoji })}
                                            className={`text-2xl p-2 rounded-lg transition-all ${newMemory.emoji === emoji
                                                    ? 'bg-primary/30 ring-2 ring-primary'
                                                    : 'bg-surface hover:bg-surface-hover'
                                                }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="text-sm text-text-secondary mb-1 block">Title</label>
                                <input
                                    type="text"
                                    value={newMemory.title}
                                    onChange={e => setNewMemory({ ...newMemory, title: e.target.value })}
                                    placeholder="What's this memory about?"
                                    className="input"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="text-sm text-text-secondary mb-1 block">Description</label>
                                <textarea
                                    value={newMemory.description}
                                    onChange={e => setNewMemory({ ...newMemory, description: e.target.value })}
                                    placeholder="Tell the story..."
                                    rows={3}
                                    className="input resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button onClick={handleAddMemory} className="btn-primary flex-1">
                                    Save Memory
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
