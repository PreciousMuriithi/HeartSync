// HeartSync 2.0 - Dr. Harmony - AI Relationship Therapist
// Made with 💕 for Precious & Safari

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '@/lib/auth-context';

interface TherapistMessage {
    id: string;
    role: 'user' | 'therapist';
    content: string;
    timestamp: Date;
}

// Dr. Harmony's personality and responses
const therapistPersona = {
    name: 'Dr. Harmony',
    title: 'Relationship & Marriage Therapist',
    avatar: '🌸',
    greeting: (userName: string, partnerName: string) => `Hello ${userName}! 💕 It's wonderful to see you. I'm Dr. Harmony, and I'm here to support you and ${partnerName} on your journey together. This is a safe, private space where you can share anything on your mind. How are you feeling today?`,
};

// Contextual response templates based on mood/topic
const responseTemplates = {
    positive: [
        "That's beautiful to hear! Celebrating these positive moments is so important. What made this experience special for you?",
        "I can sense the joy in your words. It's wonderful that you're acknowledging these good feelings. How does {partner} usually respond when you share these happy moments?",
        "This kind of appreciation strengthens your bond. Have you told {partner} how much this means to you?",
    ],
    concern: [
        "Thank you for sharing this with me. It takes courage to be vulnerable. Can you tell me more about what's been weighing on you?",
        "I hear you, and your feelings are completely valid. When did you first start feeling this way?",
        "It sounds like this has been on your mind. Have you had a chance to express these feelings to {partner}?",
    ],
    conflict: [
        "Conflict is a natural part of any relationship. What matters is how we navigate through it. Can you walk me through what happened?",
        "I appreciate you coming to me with this. Arguments can feel overwhelming. Take a breath - we'll work through this together. What do you feel the core issue is?",
        "It sounds like you're both hurting. Remember, you're on the same team. What do you think {partner} might be feeling right now?",
    ],
    advice: [
        "Here's something that often helps couples: Try using 'I feel' statements instead of 'You always' or 'You never'. This keeps communication open and non-defensive.",
        "One beautiful practice is the '5:1 ratio' - for every critical comment, try to share five positive ones. It transforms the emotional atmosphere of a relationship.",
        "Consider scheduling regular 'check-ins' with each other - dedicated time to share feelings without distractions. Would you like to try this with {partner}?",
    ],
    encouragement: [
        "I've been observing your journey, and I'm genuinely impressed by the effort you both put into your relationship. Your hearts are in the right place. 💕",
        "Remember - every couple faces challenges. What sets strong relationships apart is the willingness to grow together. You're doing exactly that.",
        "The fact that you're here, seeking to understand and improve, shows the depth of your love. {partner} is lucky to have someone who cares this much.",
    ],
    milestone: [
        "I noticed you've maintained a {streak}-day streak! This consistency shows beautiful dedication to each other. Keep nurturing this connection! 🔥",
        "Your trust score has been growing! This tells me you're both investing in building a secure, loving foundation. I'm proud of you both. 🛡️",
        "Look at all those hearts you've earned together! Each one represents a moment of love and appreciation. Keep making memories! ❤️",
    ],
};

// Simple keyword-based response selection (in production, use actual AI)
function getTherapistResponse(message: string, partnerName: string, stats: any): string {
    const lowerMessage = message.toLowerCase();

    // Check for keywords
    if (lowerMessage.includes('happy') || lowerMessage.includes('great') || lowerMessage.includes('love') || lowerMessage.includes('amazing')) {
        const responses = responseTemplates.positive;
        return responses[Math.floor(Math.random() * responses.length)].replace('{partner}', partnerName);
    }

    if (lowerMessage.includes('worried') || lowerMessage.includes('concerned') || lowerMessage.includes('sad') || lowerMessage.includes('upset')) {
        const responses = responseTemplates.concern;
        return responses[Math.floor(Math.random() * responses.length)].replace('{partner}', partnerName);
    }

    if (lowerMessage.includes('fight') || lowerMessage.includes('argue') || lowerMessage.includes('angry') || lowerMessage.includes('mad')) {
        const responses = responseTemplates.conflict;
        return responses[Math.floor(Math.random() * responses.length)].replace('{partner}', partnerName);
    }

    if (lowerMessage.includes('advice') || lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('tips')) {
        const responses = responseTemplates.advice;
        return responses[Math.floor(Math.random() * responses.length)].replace('{partner}', partnerName);
    }

    if (lowerMessage.includes('milestone') || lowerMessage.includes('streak') || lowerMessage.includes('progress')) {
        const responses = responseTemplates.milestone;
        return responses[Math.floor(Math.random() * responses.length)]
            .replace('{partner}', partnerName)
            .replace('{streak}', stats?.streak || '0');
    }

    // Default encouraging response
    const responses = responseTemplates.encouragement;
    return responses[Math.floor(Math.random() * responses.length)].replace('{partner}', partnerName);
}

export default function TherapistPage() {
    const router = useRouter();
    const { user, partner, couple } = useAuth();
    const [messages, setMessages] = useState<TherapistMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const partnerName = partner?.nickname || partner?.name || 'your partner';

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0 && user) {
            const userName = user.nickname || user.name;
            const greeting: TherapistMessage = {
                id: 'greeting',
                role: 'therapist',
                content: therapistPersona.greeting(userName, partnerName),
                timestamp: new Date(),
            };
            setMessages([greeting]);
        }
    }, [user, partnerName, messages.length]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMessage: TherapistMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate therapist typing delay
        setTimeout(() => {
            const response = getTherapistResponse(inputValue, partnerName, couple);

            const therapistMessage: TherapistMessage = {
                id: (Date.now() + 1).toString(),
                role: 'therapist',
                content: response,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, therapistMessage]);
            setIsTyping(false);
        }, 1500 + Math.random() * 1000);

        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Quick prompts for easy conversation starters
    const quickPrompts = [
        "I'm feeling happy today",
        "I need some relationship advice",
        "We had a small argument",
        "How can we improve our communication?",
        "Tell me about our milestones",
    ];

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="flex-shrink-0 bg-background-secondary/80 backdrop-blur-md border-b border-white/5 px-4 py-3 safe-top">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <button onClick={() => router.push('/')} className="btn-ghost p-2">
                        ←
                    </button>

                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl">
                            {therapistPersona.avatar}
                        </div>
                        <div>
                            <div className="font-semibold text-text-primary">{therapistPersona.name}</div>
                            <div className="text-xs text-text-muted">{therapistPersona.title}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-success">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        Private
                    </div>
                </div>
            </header>

            {/* Disclaimer */}
            <div className="bg-secondary/10 border-b border-white/5 px-4 py-2">
                <p className="text-xs text-center text-text-muted max-w-lg mx-auto">
                    🔒 This is your private session. {partnerName} cannot see your conversations here.
                </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="max-w-lg mx-auto space-y-4">
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role === 'therapist' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm mr-2 flex-shrink-0">
                                    {therapistPersona.avatar}
                                </div>
                            )}

                            <div className={`max-w-[80%] ${message.role === 'user'
                                    ? 'bg-primary text-white rounded-2xl rounded-tr-sm'
                                    : 'bg-surface border border-white/10 text-text-primary rounded-2xl rounded-tl-sm'
                                } px-4 py-3`}>
                                <p className="leading-relaxed">{message.content}</p>
                                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/60' : 'text-text-muted'
                                    }`}>
                                    {format(message.timestamp, 'h:mm a')}
                                </p>
                            </div>
                        </motion.div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm">
                                {therapistPersona.avatar}
                            </div>
                            <div className="bg-surface border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
                <div className="px-4 pb-2">
                    <div className="max-w-lg mx-auto">
                        <p className="text-xs text-text-muted mb-2">Quick topics:</p>
                        <div className="flex flex-wrap gap-2">
                            {quickPrompts.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInputValue(prompt)}
                                    className="text-xs bg-surface hover:bg-surface-hover text-text-secondary px-3 py-1.5 rounded-full transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="flex-shrink-0 bg-background-secondary/80 backdrop-blur-md border-t border-white/5 px-4 py-3 safe-bottom">
                <div className="max-w-lg mx-auto flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Share what's on your mind..."
                        className="input flex-1"
                        disabled={isTyping}
                    />

                    <motion.button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping}
                        className="btn-primary p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="text-xl">💬</span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
