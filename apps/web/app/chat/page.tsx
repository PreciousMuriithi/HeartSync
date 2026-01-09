// HeartSync 2.0 - Chat Page
// Made with 💕 for Precious & Safari

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/lib/socket-context';
import { useEncryption } from '@/lib/use-encryption';
import EmojiPicker from 'emoji-picker-react';

interface Message {
    id: string;
    senderId: string;
    content: string;
    type: string;
    isRead: boolean;
    createdAt: Date;
    reactions: { emoji: string; userId: string }[];
}

export default function ChatPage() {
    const { isAuthenticated, user, partner } = useAuth();
    const { socket, partnerPresence, startTyping, stopTyping, emit } = useSocket();
    const { encrypt, decrypt, canEncrypt } = useEncryption();
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Listen for new messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data: any) => {
            const decryptedContent = decrypt({
                ciphertext: data.contentEncrypted,
                nonce: data.contentNonce,
            });

            const newMessage: Message = {
                id: data.id,
                senderId: data.senderId,
                content: decryptedContent || '[Failed to decrypt]',
                type: data.type,
                isRead: false,
                createdAt: new Date(data.createdAt),
                reactions: [],
            };

            setMessages(prev => [...prev, newMessage]);
        };

        const handleReaction = (data: any) => {
            setMessages(prev => prev.map(msg => {
                if (msg.id === data.messageId) {
                    return {
                        ...msg,
                        reactions: [...msg.reactions, { emoji: data.emoji, userId: data.userId }],
                    };
                }
                return msg;
            }));
        };

        socket.on('message:new', handleNewMessage);
        socket.on('message:reaction', handleReaction);

        return () => {
            socket.off('message:new', handleNewMessage);
            socket.off('message:reaction', handleReaction);
        };
    }, [socket, decrypt]);

    // Initial load simulation (would be tRPC query in production)
    useEffect(() => {
        setIsLoading(false);
    }, []);

    const handleSend = useCallback(() => {
        if (!inputValue.trim() || !canEncrypt) return;

        const encrypted = encrypt(inputValue.trim());
        if (!encrypted) return;

        const tempId = `temp-${Date.now()}`;
        const newMessage: Message = {
            id: tempId,
            senderId: user!.id,
            content: inputValue.trim(),
            type: 'text',
            isRead: false,
            createdAt: new Date(),
            reactions: [],
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
        stopTyping();

        // Emit to socket
        emit('message:send', {
            id: tempId,
            contentEncrypted: encrypted.ciphertext,
            contentNonce: encrypted.nonce,
            type: 'text',
            createdAt: newMessage.createdAt.toISOString(),
        });

        inputRef.current?.focus();
    }, [inputValue, canEncrypt, encrypt, user, emit, stopTyping]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (e.target.value) {
            startTyping();
        } else {
            stopTyping();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEmojiClick = (emojiData: any) => {
        setInputValue(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
        inputRef.current?.focus();
    };

    const handleReaction = (messageId: string, emoji: string) => {
        emit('message:reaction', { messageId, emoji });
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="flex-shrink-0 bg-background-secondary/80 backdrop-blur-md border-b border-white/5 px-4 py-3 safe-top">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <button
                        onClick={() => router.push('/')}
                        className="btn-ghost p-2"
                    >
                        ←
                    </button>

                    {partner && (
                        <div className="flex items-center gap-2 flex-1">
                            <span className="avatar-emojis text-xl">
                                {partner.avatarEmojis.join('')}
                            </span>
                            <div>
                                <div className="font-medium text-text-primary">
                                    {partner.nickname || partner.name}
                                </div>
                                <div className="text-xs text-text-muted">
                                    {partnerPresence.isTyping
                                        ? 'typing...'
                                        : partnerPresence.isOnline
                                            ? 'Online'
                                            : 'Offline'}
                                </div>
                            </div>
                        </div>
                    )}

                    <span className={`w-3 h-3 rounded-full ${partnerPresence.isOnline ? 'bg-success' : 'bg-text-muted'
                        }`} />
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="max-w-lg mx-auto space-y-3">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="text-3xl"
                            >
                                💕
                            </motion.div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-4xl mb-4 block">💬</span>
                            <p className="text-text-muted">
                                Start a conversation with {partner?.nickname || partner?.name || 'your partner'}
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {messages.map((message) => {
                                const isMine = message.senderId === user.id;

                                return (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`group relative ${isMine ? 'chat-bubble-sent' : 'chat-bubble-received'
                                            }`}>
                                            <p className="break-words">{message.content}</p>

                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs opacity-60">
                                                    {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                                                </span>
                                                {isMine && message.isRead && (
                                                    <span className="text-xs">✓✓</span>
                                                )}
                                            </div>

                                            {/* Reactions */}
                                            {message.reactions.length > 0 && (
                                                <div className="absolute -bottom-3 left-2 flex gap-0.5 bg-surface rounded-full px-1 border border-white/10">
                                                    {message.reactions.map((r, i) => (
                                                        <span key={i} className="text-sm">{r.emoji}</span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Quick reaction buttons (on hover) */}
                                            <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleReaction(message.id, '❤️')}
                                                    className="text-lg hover:scale-125 transition-transform"
                                                >
                                                    ❤️
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}

                    {/* Typing Indicator */}
                    {partnerPresence.isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2"
                        >
                            <div className="chat-bubble-received">
                                <div className="typing-indicator">
                                    <span className="dot" />
                                    <span className="dot" />
                                    <span className="dot" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 bg-background-secondary/80 backdrop-blur-md border-t border-white/5 px-4 py-3 safe-bottom">
                <div className="max-w-lg mx-auto flex items-center gap-2">
                    {/* Emoji Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="btn-ghost p-2 text-xl"
                        >
                            😊
                        </button>

                        {showEmojiPicker && (
                            <div className="emoji-picker-wrapper">
                                <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    theme="dark" as any
                                    width={300}
                                    height={400}
                                />
                            </div>
                        )}
                    </div>

                    {/* Text Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={`Message ${partner?.nickname || partner?.name || 'your partner'}...`}
                        className="input flex-1"
                    />

                    {/* Send Button */}
                    <motion.button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || !canEncrypt}
                        className="btn-primary p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="text-xl">💌</span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
