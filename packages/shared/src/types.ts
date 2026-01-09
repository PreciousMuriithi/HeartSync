// HeartSync 2.0 - Core Types
// Made with 💕 for Precious & Safari

// ============================================
// User & Couple Types
// ============================================

export interface User {
    id: string;
    name: string;
    nickname?: string;
    avatarEmojis: string[]; // Array of emojis like ['🧚', '💚', '🌸']
    publicKey: string; // For E2E encryption
    createdAt: Date;
}

export interface Couple {
    id: string;
    inviteCode: string;
    user1: User;
    user2: User;
    hearts: number;
    trustScore: number;
    streak: number;
    streakStartDate: Date;
    settings: CoupleSettings;
    createdAt: Date;
}

export interface CoupleSettings {
    theme: ThemeConfig;
    customFlags: CustomFlag[];
    notificationSounds: NotificationSounds;
    privacyMode: boolean;
}

// ============================================
// Message Types
// ============================================

export interface Message {
    id: string;
    coupleId: string;
    senderId: string;
    content: string; // Encrypted
    type: MessageType;
    replyToId?: string;
    reactions: Reaction[];
    isRead: boolean;
    isDeleted: boolean;
    deletedForBoth: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type MessageType =
    | 'text'
    | 'emoji'
    | 'sticker'
    | 'voice'
    | 'image'
    | 'letter'
    | 'system';

export interface Reaction {
    userId: string;
    emoji: string;
    createdAt: Date;
}

// ============================================
// Flag System
// ============================================

export interface Flag {
    id: string;
    coupleId: string;
    senderId: string;
    intensity: FlagIntensity; // -5 to +5
    message?: string; // Encrypted
    customFlagId?: string;
    createdAt: Date;
}

export type FlagIntensity = -5 | -4 | -3 | -2 | -1 | 1 | 2 | 3 | 4 | 5;

export interface CustomFlag {
    id: string;
    intensity: FlagIntensity;
    name: string;
    icon: string;
    description: string;
}

// ============================================
// Love Letters
// ============================================

export interface LoveLetter {
    id: string;
    coupleId: string;
    senderId: string;
    title: string; // Encrypted
    content: string; // Encrypted
    heartsRewarded: number;
    isRead: boolean;
    createdAt: Date;
}

// ============================================
// Memory Lane
// ============================================

export interface Memory {
    id: string;
    coupleId: string;
    createdById: string;
    photoUrl: string;
    caption: string; // Encrypted
    memoryDate: Date;
    tags: string[];
    createdAt: Date;
}

// ============================================
// Calendar & Countdowns
// ============================================

export interface CalendarEvent {
    id: string;
    coupleId: string;
    title: string;
    description?: string;
    date: Date;
    isRecurring: boolean;
    recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    isCountdown: boolean;
    color: string;
    createdAt: Date;
}

// ============================================
// Trust Store
// ============================================

export interface TrustStoreItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: string;
    category: 'romance' | 'fun' | 'practical' | 'special';
}

export interface TrustStorePurchase {
    id: string;
    coupleId: string;
    buyerId: string;
    itemId: string;
    isRedeemed: boolean;
    purchasedAt: Date;
    redeemedAt?: Date;
}

// ============================================
// Mini Games
// ============================================

export interface TruthOrDare {
    id: string;
    type: 'truth' | 'dare';
    prompt: string;
    isCustom: boolean;
    intensity: 'mild' | 'medium' | 'spicy';
}

export interface WouldYouRather {
    id: string;
    optionA: string;
    optionB: string;
    isCustom: boolean;
}

export interface LoveQuizQuestion {
    id: string;
    question: string;
    category: 'memories' | 'preferences' | 'dreams' | 'history';
    correctAnswerUserId: string;
}

// ============================================
// Presence & Real-time
// ============================================

export interface PresenceState {
    isOnline: boolean;
    isTyping: boolean;
    lastSeenAt: Date;
    currentScreen?: string;
}

// ============================================
// Theme Types
// ============================================

export interface ThemeConfig {
    id: string;
    name: string;
    isDark: boolean;
    colors: ThemeColors;
    isCustom: boolean;
}

export interface ThemeColors {
    // Core colors
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceHover: string;

    // Accent colors
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;

    // Text colors
    text: string;
    textSecondary: string;
    textMuted: string;

    // Chat bubbles
    bubbleSent: string;
    bubbleSentText: string;
    bubbleReceived: string;
    bubbleReceivedText: string;

    // Flags
    flagPositive: string;
    flagNegative: string;

    // Status
    success: string;
    warning: string;
    error: string;

    // Special
    hearts: string;
    trust: string;
    streak: string;
}

// ============================================
// Notification Sounds
// ============================================

export interface NotificationSounds {
    message: string;
    letter: string;
    beacon: string;
    flag: string;
}

// ============================================
// Custom Stickers
// ============================================

export interface StickerPack {
    id: string;
    name: string;
    coupleId: string;
    stickers: Sticker[];
    createdAt: Date;
}

export interface Sticker {
    id: string;
    packId: string;
    imageUrl: string;
    name: string;
    tags: string[];
}

// ============================================
// Audit Log
// ============================================

export interface AuditLogEntry {
    id: string;
    coupleId: string;
    actorId: string;
    action: AuditAction;
    details: string;
    createdAt: Date;
}

export type AuditAction =
    | 'flag_sent'
    | 'letter_sent'
    | 'beacon_sent'
    | 'hearts_earned'
    | 'trust_store_purchase'
    | 'trust_store_redeem'
    | 'game_played'
    | 'memory_added'
    | 'event_created'
    | 'theme_changed'
    | 'settings_updated';
