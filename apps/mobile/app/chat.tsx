// HeartSync 2.0 - Mobile Chat Screen
// Made with 💕 for Precious & Safari

import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';

const colors = {
    background: '#0A0A0C',
    backgroundSecondary: '#121215',
    surface: '#1A1A1F',
    surfaceHover: '#252529',
    primary: '#E84057',
    text: '#FAFAFA',
    textSecondary: '#B8B8BC',
    textMuted: '#6B6B70',
    bubbleSent: '#E84057',
    bubbleReceived: '#252529',
};

interface Message {
    id: string;
    senderId: string;
    content: string;
    createdAt: Date;
    isRead: boolean;
    reactions: { emoji: string; userId: string }[];
}

export default function ChatScreen() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Simulated user data
    const userId = 'user1';
    const partner = {
        name: 'Safari',
        nickname: 'Mi Amor',
        avatarEmojis: ['🖤', '⛓️', '🧛'],
        isOnline: true,
    };

    // Demo messages
    useEffect(() => {
        setMessages([
            {
                id: '1',
                senderId: 'user2',
                content: 'Hey Tavi 💕',
                createdAt: new Date(Date.now() - 3600000),
                isRead: true,
                reactions: [],
            },
            {
                id: '2',
                senderId: 'user1',
                content: 'Mi Amor! 🥰 How are you?',
                createdAt: new Date(Date.now() - 3500000),
                isRead: true,
                reactions: [{ emoji: '❤️', userId: 'user2' }],
            },
            {
                id: '3',
                senderId: 'user2',
                content: 'Better now that I\'m talking to you 🖤',
                createdAt: new Date(Date.now() - 3400000),
                isRead: true,
                reactions: [],
            },
        ]);
    }, []);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: userId,
            content: inputText.trim(),
            createdAt: new Date(),
            isRead: false,
            reactions: [],
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');

        // Scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMine = item.senderId === userId;

        return (
            <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
                <View style={[
                    styles.bubble,
                    isMine ? styles.bubbleSent : styles.bubbleReceived,
                ]}>
                    <Text style={[
                        styles.messageText,
                        isMine ? styles.messageTextSent : styles.messageTextReceived,
                    ]}>
                        {item.content}
                    </Text>
                    <View style={styles.messageFooter}>
                        <Text style={styles.messageTime}>
                            {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                        </Text>
                        {isMine && item.isRead && (
                            <Text style={styles.readReceipt}>✓✓</Text>
                        )}
                    </View>

                    {/* Reactions */}
                    {item.reactions.length > 0 && (
                        <View style={styles.reactions}>
                            {item.reactions.map((r, i) => (
                                <Text key={i} style={styles.reactionEmoji}>{r.emoji}</Text>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={88}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <Text style={styles.partnerEmojis}>{partner.avatarEmojis.join('')}</Text>
                    <View>
                        <Text style={styles.partnerName}>{partner.nickname}</Text>
                        <Text style={styles.partnerStatus}>
                            {isPartnerTyping ? 'typing...' : partner.isOnline ? 'Online' : 'Offline'}
                        </Text>
                    </View>
                </View>

                <View style={[styles.onlineDot, partner.isOnline && styles.onlineDotActive]} />
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>💬</Text>
                        <Text style={styles.emptyText}>
                            Start a conversation with {partner.nickname}
                        </Text>
                    </View>
                }
            />

            {/* Typing indicator */}
            {isPartnerTyping && (
                <View style={styles.typingIndicator}>
                    <View style={styles.typingDot} />
                    <View style={[styles.typingDot, styles.typingDotDelay1]} />
                    <View style={[styles.typingDot, styles.typingDotDelay2]} />
                </View>
            )}

            {/* Input area */}
            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.emojiBtn}>
                    <Text style={styles.emojiBtnText}>😊</Text>
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={`Message ${partner.nickname}...`}
                    placeholderTextColor={colors.textMuted}
                    multiline
                    maxLength={5000}
                />

                <TouchableOpacity
                    style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                    onPress={handleSend}
                    disabled={!inputText.trim()}
                >
                    <Text style={styles.sendBtnText}>💌</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 48,
        backgroundColor: colors.backgroundSecondary,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backBtn: {
        padding: 8,
        marginRight: 8,
    },
    backText: {
        color: colors.text,
        fontSize: 20,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    partnerEmojis: {
        fontSize: 24,
    },
    partnerName: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    partnerStatus: {
        color: colors.textMuted,
        fontSize: 12,
    },
    onlineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.textMuted,
    },
    onlineDotActive: {
        backgroundColor: '#7DD3A8',
    },

    // Messages
    messagesList: {
        padding: 16,
        gap: 12,
    },
    messageRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    messageRowMine: {
        justifyContent: 'flex-end',
    },
    bubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },
    bubbleSent: {
        backgroundColor: colors.bubbleSent,
        borderTopRightRadius: 4,
    },
    bubbleReceived: {
        backgroundColor: colors.bubbleReceived,
        borderTopLeftRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    messageTextSent: {
        color: 'white',
    },
    messageTextReceived: {
        color: colors.text,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    messageTime: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
    },
    readReceipt: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
    },
    reactions: {
        position: 'absolute',
        bottom: -8,
        left: 8,
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 10,
        paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    reactionEmoji: {
        fontSize: 12,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        color: colors.textMuted,
        fontSize: 16,
    },

    // Typing indicator
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingLeft: 24,
        paddingBottom: 8,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.textMuted,
    },
    typingDotDelay1: {
        opacity: 0.7,
    },
    typingDotDelay2: {
        opacity: 0.4,
    },

    // Input
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        backgroundColor: colors.backgroundSecondary,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        gap: 8,
    },
    emojiBtn: {
        padding: 8,
    },
    emojiBtnText: {
        fontSize: 24,
    },
    input: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: colors.text,
        fontSize: 16,
        maxHeight: 120,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    sendBtn: {
        backgroundColor: colors.primary,
        borderRadius: 20,
        padding: 12,
    },
    sendBtnDisabled: {
        opacity: 0.5,
    },
    sendBtnText: {
        fontSize: 20,
    },
});
