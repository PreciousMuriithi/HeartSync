// HeartSync 2.0 - Dr. Harmony Dashboard Widget
// Provides insights and check-ins on the home screen
// Made with 💕 for Precious & Safari

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface TherapistInsight {
    id: string;
    type: 'encouragement' | 'tip' | 'milestone' | 'checkin' | 'recommendation';
    message: string;
    action?: string;
    actionLabel?: string;
}

// Contextual insights based on couple stats
function generateInsights(stats: { hearts: number; trustScore: number; streak: number }): TherapistInsight[] {
    const insights: TherapistInsight[] = [];

    // Streak-based insights
    if (stats.streak >= 7) {
        insights.push({
            id: 'streak-celebration',
            type: 'milestone',
            message: `🔥 ${stats.streak} days connected! I'm genuinely impressed by your dedication to each other. This consistency builds a strong foundation of trust.`,
        });
    } else if (stats.streak === 0) {
        insights.push({
            id: 'streak-encourage',
            type: 'checkin',
            message: `Hey there! 💕 It's been a while since you two checked in together. Even a simple "thinking of you" message can brighten your partner's day.`,
            action: '/chat',
            actionLabel: 'Send a message',
        });
    }

    // Trust score insights
    if (stats.trustScore >= 80) {
        insights.push({
            id: 'trust-high',
            type: 'encouragement',
            message: `🛡️ Your trust score is ${stats.trustScore}! This tells me you've been building something beautiful. Keep nurturing this safe space you've created together.`,
        });
    } else if (stats.trustScore < 50) {
        insights.push({
            id: 'trust-low',
            type: 'tip',
            message: `I notice your trust score could use some attention. Remember: small, consistent positive interactions rebuild trust faster than grand gestures. Try sending a green flag today!`,
            action: '/flags',
            actionLabel: 'Send a flag',
        });
    }

    // Hearts insights  
    if (stats.hearts >= 100) {
        insights.push({
            id: 'hearts-celebrate',
            type: 'milestone',
            message: `❤️ Look at all those hearts - ${stats.hearts}! Each one represents a moment of love and appreciation. I'm proud of the love you're cultivating.`,
        });
    }

    // General tips (rotate through)
    const tips = [
        {
            id: 'tip-1',
            type: 'tip' as const,
            message: `💡 Today's relationship tip: The "6-second kiss" - kissing for 6 seconds releases oxytocin and helps maintain intimacy. Try it with your partner today!`,
        },
        {
            id: 'tip-2',
            type: 'tip' as const,
            message: `💡 Research shows that couples who express gratitude daily report higher relationship satisfaction. What are you grateful for about your partner today?`,
        },
        {
            id: 'tip-3',
            type: 'tip' as const,
            message: `💡 The 5:1 ratio: For every negative interaction, aim for five positive ones. This balance creates a thriving relationship atmosphere.`,
        },
        {
            id: 'tip-4',
            type: 'recommendation' as const,
            message: `📅 Have you planned your next date night? Regular quality time is essential. Consider scheduling something special for this week!`,
            action: '/calendar',
            actionLabel: 'Plan a date',
        },
        {
            id: 'tip-5',
            type: 'checkin' as const,
            message: `How are you feeling about your relationship today? I'm here if you need someone to talk to. Remember, seeking guidance is a sign of strength, not weakness.`,
            action: '/therapist',
            actionLabel: 'Talk to me',
        },
    ];

    // Add a random tip
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    insights.push(randomTip);

    return insights;
}

interface TherapistWidgetProps {
    hearts: number;
    trustScore: number;
    streak: number;
}

export default function TherapistWidget({ hearts, trustScore, streak }: TherapistWidgetProps) {
    const [currentInsight, setCurrentInsight] = useState<TherapistInsight | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [allInsights, setAllInsights] = useState<TherapistInsight[]>([]);

    useEffect(() => {
        const insights = generateInsights({ hearts, trustScore, streak });
        setAllInsights(insights);
        if (insights.length > 0) {
            setCurrentInsight(insights[0]);
        }
    }, [hearts, trustScore, streak]);

    if (!currentInsight) return null;

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'encouragement': return '💪';
            case 'tip': return '💡';
            case 'milestone': return '🏆';
            case 'checkin': return '💕';
            case 'recommendation': return '✨';
            default: return '🌸';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
        >
            {/* Therapist Card */}
            <div className="glass-card overflow-hidden">
                {/* Header */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full px-4 py-3 flex items-center gap-3 bg-gradient-to-r from-pink-500/10 to-purple-600/10 border-b border-white/5"
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-lg">
                        🌸
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-semibold text-text-primary text-sm">Dr. Harmony</p>
                        <p className="text-xs text-text-muted">Your Relationship Therapist</p>
                    </div>
                    <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="text-text-muted"
                    >
                        ▼
                    </motion.span>
                </button>

                {/* Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4">
                                {/* Current Insight */}
                                <motion.div
                                    key={currentInsight.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex gap-3"
                                >
                                    <span className="text-xl">{getTypeIcon(currentInsight.type)}</span>
                                    <div className="flex-1">
                                        <p className="text-sm text-text-primary leading-relaxed">
                                            {currentInsight.message}
                                        </p>

                                        {currentInsight.action && (
                                            <Link
                                                href={currentInsight.action}
                                                className="inline-block mt-3 text-sm text-primary font-medium hover:text-primary-hover transition-colors"
                                            >
                                                {currentInsight.actionLabel} →
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Actions */}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                                    <Link
                                        href="/therapist"
                                        className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors"
                                    >
                                        <span>💬</span>
                                        <span>Talk privately</span>
                                    </Link>

                                    {allInsights.length > 1 && (
                                        <button
                                            onClick={() => {
                                                const currentIndex = allInsights.findIndex(i => i.id === currentInsight.id);
                                                const nextIndex = (currentIndex + 1) % allInsights.length;
                                                setCurrentInsight(allInsights[nextIndex]);
                                            }}
                                            className="text-xs text-text-muted hover:text-text-primary transition-colors"
                                        >
                                            More insights →
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
