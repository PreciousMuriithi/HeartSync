// HeartSync 2.0 - Trust Store
// Made with 💕 for Precious & Safari

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';

interface StoreItem {
    id: string;
    name: string;
    description: string;
    emoji: string;
    cost: number;
    isPurchased: boolean;
    isRedeemed: boolean;
}

// Store items
const defaultItems: StoreItem[] = [
    { id: '1', name: 'Nag-free Day', description: 'Partner gets a free pass for one day', emoji: '🤐', cost: 50, isPurchased: false, isRedeemed: false },
    { id: '2', name: 'Movie Choice', description: 'You pick the next movie, no complaints', emoji: '🎬', cost: 30, isPurchased: false, isRedeemed: false },
    { id: '3', name: 'Instant Forgiveness', description: 'One-time pass for a small oopsie', emoji: '😇', cost: 100, isPurchased: false, isRedeemed: false },
    { id: '4', name: 'Breakfast in Bed', description: 'Partner makes you breakfast', emoji: '🍳', cost: 40, isPurchased: false, isRedeemed: false },
    { id: '5', name: 'Back Massage', description: '15-minute relaxing massage', emoji: '💆', cost: 35, isPurchased: false, isRedeemed: false },
    { id: '6', name: 'Date Night Veto', description: 'Veto one activity on date night', emoji: '🙅', cost: 25, isPurchased: false, isRedeemed: false },
    { id: '7', name: 'Sweet Note', description: 'Partner writes you a love note', emoji: '💝', cost: 20, isPurchased: false, isRedeemed: false },
    { id: '8', name: 'Road Trip DJ', description: 'You control the music for a whole trip', emoji: '🎵', cost: 45, isPurchased: false, isRedeemed: false },
];

export default function StorePage() {
    const router = useRouter();
    const { couple, updateCouple } = useAuth();
    const [items, setItems] = useState<StoreItem[]>(defaultItems);
    const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
    const [tab, setTab] = useState<'shop' | 'inventory'>('shop');

    const hearts = couple?.hearts || 0;

    const handlePurchase = () => {
        if (!selectedItem || hearts < selectedItem.cost) return;

        // Update hearts
        updateCouple({ hearts: hearts - selectedItem.cost });

        // Mark as purchased
        setItems(items.map(item =>
            item.id === selectedItem.id ? { ...item, isPurchased: true } : item
        ));

        setSelectedItem(null);
    };

    const handleRedeem = (itemId: string) => {
        setItems(items.map(item =>
            item.id === itemId ? { ...item, isRedeemed: true } : item
        ));
    };

    const shopItems = items.filter(i => !i.isPurchased);
    const inventoryItems = items.filter(i => i.isPurchased && !i.isRedeemed);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-secondary/80 backdrop-blur-md border-b border-white/5 px-4 py-3 safe-top">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <button onClick={() => router.push('/')} className="btn-ghost p-2">
                        ←
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-text-primary">🎁 Trust Store</h1>
                        <p className="text-xs text-text-muted">Spend your hearts</p>
                    </div>
                    <div className="flex items-center gap-1 bg-surface px-3 py-1.5 rounded-full">
                        <span className="text-lg">❤️</span>
                        <span className="font-bold text-hearts">{hearts}</span>
                    </div>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setTab('shop')}
                        className={`flex-1 py-2 rounded-lg font-medium transition-all ${tab === 'shop'
                                ? 'bg-primary text-white'
                                : 'bg-surface text-text-secondary hover:bg-surface-hover'
                            }`}
                    >
                        🛒 Shop
                    </button>
                    <button
                        onClick={() => setTab('inventory')}
                        className={`flex-1 py-2 rounded-lg font-medium transition-all ${tab === 'inventory'
                                ? 'bg-primary text-white'
                                : 'bg-surface text-text-secondary hover:bg-surface-hover'
                            }`}
                    >
                        📦 Inventory {inventoryItems.length > 0 && `(${inventoryItems.length})`}
                    </button>
                </div>

                {/* Shop */}
                {tab === 'shop' && (
                    <div className="grid grid-cols-2 gap-3">
                        {shopItems.map((item, index) => {
                            const canAfford = hearts >= item.cost;

                            return (
                                <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => canAfford && setSelectedItem(item)}
                                    disabled={!canAfford}
                                    className={`glass-card p-4 text-left transition-all ${canAfford
                                            ? 'hover:bg-surface-hover cursor-pointer'
                                            : 'opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    <span className="text-3xl block mb-2">{item.emoji}</span>
                                    <h3 className="font-medium text-text-primary text-sm">{item.name}</h3>
                                    <p className="text-xs text-text-muted mt-1 line-clamp-2">{item.description}</p>
                                    <div className="flex items-center gap-1 mt-3">
                                        <span className="text-sm">❤️</span>
                                        <span className="font-bold text-hearts">{item.cost}</span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                )}

                {/* Inventory */}
                {tab === 'inventory' && (
                    <div>
                        {inventoryItems.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="text-4xl block mb-4">📦</span>
                                <p className="text-text-muted">Your inventory is empty</p>
                                <p className="text-text-muted text-sm">Buy items from the shop!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {inventoryItems.map(item => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="glass-card p-4 flex items-center gap-4"
                                    >
                                        <span className="text-3xl">{item.emoji}</span>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-text-primary">{item.name}</h3>
                                            <p className="text-xs text-text-muted">{item.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRedeem(item.id)}
                                            className="btn-primary px-3 py-2 text-sm"
                                        >
                                            Redeem
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Purchase Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-backdrop"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content text-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <span className="text-6xl block mb-4">{selectedItem.emoji}</span>
                            <h2 className="text-xl font-bold text-text-primary mb-2">{selectedItem.name}</h2>
                            <p className="text-text-secondary mb-4">{selectedItem.description}</p>

                            <div className="flex items-center justify-center gap-2 mb-6">
                                <span className="text-2xl">❤️</span>
                                <span className="text-2xl font-bold text-hearts">{selectedItem.cost}</span>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setSelectedItem(null)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button onClick={handlePurchase} className="btn-primary flex-1">
                                    Buy Now
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
