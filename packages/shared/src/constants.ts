// HeartSync 2.0 - Constants
// Made with 💕 for Precious & Safari

import type { TrustStoreItem, TruthOrDare, WouldYouRather, CustomFlag } from './types';

// ============================================
// Couple Defaults - Precious & Safari
// ============================================

export const DEFAULT_USERS = {
    precious: {
        name: 'Precious',
        nickname: 'Tavi',
        avatarEmojis: ['🧚', '💚', '🌸'],
    },
    safari: {
        name: 'Safari',
        nickname: 'Mi Amor',
        avatarEmojis: ['🖤', '⛓️', '🧛'],
    },
} as const;

// ============================================
// Hearts & Trust System
// ============================================

export const HEARTS_CONFIG = {
    letterSent: 10,
    letterRead: 5,
    dailyCheckIn: 3,
    beaconResponse: 5,
    positiveFlag: 2,
    gameCompleted: 5,
    memoryAdded: 5,
    streakBonus: (days: number) => Math.min(days, 30), // Max 30 bonus
} as const;

export const TRUST_CONFIG = {
    baseScore: 50,
    maxScore: 100,
    positiveFlag: (intensity: number) => intensity * 2,
    negativeFlag: (intensity: number) => intensity * 3, // Negative flags hurt more
    letterSent: 5,
    dailyCheckIn: 1,
} as const;

// ============================================
// Trust Store Items
// ============================================

export const TRUST_STORE_ITEMS: TrustStoreItem[] = [
    // Romance
    {
        id: 'breakfast-bed',
        name: 'Breakfast in Bed',
        description: 'Request breakfast served to you in bed',
        cost: 50,
        icon: '🍳',
        category: 'romance',
    },
    {
        id: 'massage',
        name: '30-Minute Massage',
        description: 'A relaxing massage from your partner',
        cost: 40,
        icon: '💆',
        category: 'romance',
    },
    {
        id: 'movie-pick',
        name: 'Movie Night Choice',
        description: 'You pick the movie, no vetoes allowed',
        cost: 25,
        icon: '🎬',
        category: 'romance',
    },
    {
        id: 'love-letter',
        name: 'Handwritten Love Letter',
        description: 'Request a heartfelt handwritten letter',
        cost: 75,
        icon: '💌',
        category: 'romance',
    },

    // Fun
    {
        id: 'nag-free',
        name: 'Nag-Free Day',
        description: 'No reminders or nagging for a whole day',
        cost: 30,
        icon: '🤫',
        category: 'fun',
    },
    {
        id: 'instant-forgiveness',
        name: 'Instant Forgiveness',
        description: 'One minor mistake forgiven, no questions asked',
        cost: 60,
        icon: '😇',
        category: 'fun',
    },
    {
        id: 'chores-swap',
        name: 'Chores Swap',
        description: 'Partner does your chores for a day',
        cost: 45,
        icon: '🧹',
        category: 'fun',
    },
    {
        id: 'dessert-treat',
        name: 'Dessert Surprise',
        description: 'A surprise dessert of your choosing',
        cost: 20,
        icon: '🍰',
        category: 'fun',
    },

    // Practical
    {
        id: 'project-help',
        name: 'Project Assistance',
        description: 'Partner helps with your project/work',
        cost: 55,
        icon: '🛠️',
        category: 'practical',
    },
    {
        id: 'errand-run',
        name: 'Errand Runner',
        description: 'Partner runs an errand for you',
        cost: 35,
        icon: '🏃',
        category: 'practical',
    },

    // Special
    {
        id: 'date-plan',
        name: 'Surprise Date',
        description: 'Partner plans a complete surprise date',
        cost: 100,
        icon: '✨',
        category: 'special',
    },
    {
        id: 'wish-granted',
        name: 'One Wish',
        description: 'One reasonable wish granted, dealer\'s choice how',
        cost: 150,
        icon: '🌟',
        category: 'special',
    },
];

// ============================================
// Default Flag Meanings
// ============================================

export const DEFAULT_FLAGS: CustomFlag[] = [
    // Positive
    { id: 'flag-p1', intensity: 1, name: 'Small Kindness', icon: '💕', description: 'A small thoughtful gesture' },
    { id: 'flag-p2', intensity: 2, name: 'Sweet Moment', icon: '🥰', description: 'A sweet romantic moment' },
    { id: 'flag-p3', intensity: 3, name: 'Amazing Gesture', icon: '💗', description: 'An amazing thoughtful gesture' },
    { id: 'flag-p4', intensity: 4, name: 'Above & Beyond', icon: '💖', description: 'Going above and beyond' },
    { id: 'flag-p5', intensity: 5, name: 'Absolutely Perfect', icon: '💝', description: 'Absolutely perfect partner moment' },

    // Negative
    { id: 'flag-n1', intensity: -1, name: 'Minor Oops', icon: '😕', description: 'A small oversight' },
    { id: 'flag-n2', intensity: -2, name: 'Needs Attention', icon: '😔', description: 'Something that needs addressing' },
    { id: 'flag-n3', intensity: -3, name: 'Not Cool', icon: '😢', description: 'That wasn\'t cool' },
    { id: 'flag-n4', intensity: -4, name: 'Really Hurt', icon: '💔', description: 'That really hurt' },
    { id: 'flag-n5', intensity: -5, name: 'We Need to Talk', icon: '🚨', description: 'Serious conversation needed' },
];

// ============================================
// Truth or Dare Prompts
// ============================================

export const TRUTH_OR_DARE_PROMPTS: TruthOrDare[] = [
    // Truths - Mild
    { id: 'tod-1', type: 'truth', prompt: 'What\'s your favorite physical feature about me?', isCustom: false, intensity: 'mild' },
    { id: 'tod-2', type: 'truth', prompt: 'What did you think the first time you saw me?', isCustom: false, intensity: 'mild' },
    { id: 'tod-3', type: 'truth', prompt: 'What\'s a song that reminds you of us?', isCustom: false, intensity: 'mild' },
    { id: 'tod-4', type: 'truth', prompt: 'What\'s your favorite memory of us?', isCustom: false, intensity: 'mild' },

    // Truths - Medium
    { id: 'tod-5', type: 'truth', prompt: 'What\'s something you\'ve always wanted to try with me?', isCustom: false, intensity: 'medium' },
    { id: 'tod-6', type: 'truth', prompt: 'What\'s one thing I do that drives you crazy (in a good way)?', isCustom: false, intensity: 'medium' },
    { id: 'tod-7', type: 'truth', prompt: 'When did you know you loved me?', isCustom: false, intensity: 'medium' },

    // Truths - Spicy
    { id: 'tod-8', type: 'truth', prompt: 'What\'s your biggest fantasy involving us?', isCustom: false, intensity: 'spicy' },
    { id: 'tod-9', type: 'truth', prompt: 'What\'s the most attractive thing I\'ve ever done?', isCustom: false, intensity: 'spicy' },

    // Dares - Mild
    { id: 'tod-10', type: 'dare', prompt: 'Send me your most embarrassing selfie', isCustom: false, intensity: 'mild' },
    { id: 'tod-11', type: 'dare', prompt: 'Describe our love story in exactly 10 words', isCustom: false, intensity: 'mild' },
    { id: 'tod-12', type: 'dare', prompt: 'Send me a voice note singing our song', isCustom: false, intensity: 'mild' },

    // Dares - Medium
    { id: 'tod-13', type: 'dare', prompt: 'Write me a mini love poem right now', isCustom: false, intensity: 'medium' },
    { id: 'tod-14', type: 'dare', prompt: 'Plan our next date in detail', isCustom: false, intensity: 'medium' },

    // Dares - Spicy
    { id: 'tod-15', type: 'dare', prompt: 'Send me your most attractive photo', isCustom: false, intensity: 'spicy' },
    { id: 'tod-16', type: 'dare', prompt: 'Describe in detail what you\'d do if I was there right now', isCustom: false, intensity: 'spicy' },
];

// ============================================
// Would You Rather Prompts
// ============================================

export const WOULD_YOU_RATHER_PROMPTS: WouldYouRather[] = [
    { id: 'wyr-1', optionA: 'Have a romantic dinner at home', optionB: 'Go on an adventure date', isCustom: false },
    { id: 'wyr-2', optionA: 'Receive love letters', optionB: 'Receive surprise gifts', isCustom: false },
    { id: 'wyr-3', optionA: 'Cuddle and watch movies', optionB: 'Dance together in the living room', isCustom: false },
    { id: 'wyr-4', optionA: 'Wake up to breakfast in bed', optionB: 'Fall asleep to a back massage', isCustom: false },
    { id: 'wyr-5', optionA: 'Take a road trip together', optionB: 'Spend a weekend at a cozy cabin', isCustom: false },
    { id: 'wyr-6', optionA: 'Have mind-reading powers (only with me)', optionB: 'Feel what I\'m feeling (empathy link)', isCustom: false },
    { id: 'wyr-7', optionA: 'Relive our first date', optionB: 'Fast forward to our 50th anniversary', isCustom: false },
    { id: 'wyr-8', optionA: 'Star in a rom-com together', optionB: 'Have a love song written about us', isCustom: false },
];

// ============================================
// App Constants
// ============================================

export const APP_CONFIG = {
    name: 'HeartSync',
    version: '2.0.0',
    maxMessageLength: 10000,
    maxLetterLength: 50000,
    maxCaptionLength: 1000,
    maxStickerPacks: 50,
    maxStickersPerPack: 100,
    maxCustomFlags: 20,
    maxCustomThemes: 10,
    streakResetHours: 48, // Hours before streak resets
} as const;
