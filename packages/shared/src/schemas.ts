// HeartSync 2.0 - Validation Schemas
// Made with 💕 for Precious & Safari

import { z } from 'zod';

// ============================================
// Auth Schemas
// ============================================

export const signupSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50),
    nickname: z.string().max(30).optional(),
    avatarEmojis: z.array(z.string()).min(1).max(5),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
    coupleCode: z.string().length(8, 'Couple code must be 8 characters'),
    name: z.string().min(1),
    password: z.string().min(1),
});

export const joinCoupleSchema = z.object({
    inviteCode: z.string().length(8, 'Invite code must be 8 characters'),
    name: z.string().min(1).max(50),
    nickname: z.string().max(30).optional(),
    avatarEmojis: z.array(z.string()).min(1).max(5),
    password: z.string().min(8),
});

// ============================================
// Message Schemas
// ============================================

export const sendMessageSchema = z.object({
    content: z.string().min(1).max(10000),
    type: z.enum(['text', 'emoji', 'sticker', 'voice', 'image']),
    replyToId: z.string().uuid().optional(),
});

export const reactionSchema = z.object({
    messageId: z.string().uuid(),
    emoji: z.string().min(1).max(10),
});

// ============================================
// Flag Schemas
// ============================================

export const sendFlagSchema = z.object({
    intensity: z.number().int().min(-5).max(5).refine(n => n !== 0, 'Intensity cannot be 0'),
    message: z.string().max(500).optional(),
    customFlagId: z.string().uuid().optional(),
});

export const customFlagSchema = z.object({
    intensity: z.number().int().min(-5).max(5).refine(n => n !== 0),
    name: z.string().min(1).max(50),
    icon: z.string().min(1).max(10),
    description: z.string().max(200),
});

// ============================================
// Letter Schemas
// ============================================

export const sendLetterSchema = z.object({
    title: z.string().min(1).max(100),
    content: z.string().min(1).max(50000),
});

// ============================================
// Memory Schemas
// ============================================

export const addMemorySchema = z.object({
    photoUrl: z.string().url(),
    caption: z.string().max(1000),
    memoryDate: z.coerce.date(),
    tags: z.array(z.string().max(30)).max(10),
});

// ============================================
// Calendar Schemas
// ============================================

export const createEventSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    date: z.coerce.date(),
    isRecurring: z.boolean().default(false),
    recurringType: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
    isCountdown: z.boolean().default(false),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

// ============================================
// Game Schemas
// ============================================

export const truthOrDareSchema = z.object({
    type: z.enum(['truth', 'dare']),
    prompt: z.string().min(1).max(500),
    intensity: z.enum(['mild', 'medium', 'spicy']),
});

export const wouldYouRatherSchema = z.object({
    optionA: z.string().min(1).max(200),
    optionB: z.string().min(1).max(200),
});

export const loveQuizSchema = z.object({
    question: z.string().min(1).max(300),
    category: z.enum(['memories', 'preferences', 'dreams', 'history']),
    answer: z.string().min(1).max(500),
});

// ============================================
// Theme Schemas
// ============================================

export const themeColorsSchema = z.object({
    background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    backgroundSecondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    surface: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    surfaceHover: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    primaryHover: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    text: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    textSecondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    textMuted: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    bubbleSent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    bubbleSentText: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    bubbleReceived: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    bubbleReceivedText: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    flagPositive: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    flagNegative: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    success: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    warning: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    error: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    hearts: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    trust: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    streak: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export const createThemeSchema = z.object({
    name: z.string().min(1).max(30),
    isDark: z.boolean(),
    colors: themeColorsSchema,
});

// ============================================
// Sticker Schemas
// ============================================

export const createStickerPackSchema = z.object({
    name: z.string().min(1).max(30),
});

export const addStickerSchema = z.object({
    packId: z.string().uuid(),
    imageUrl: z.string().url(),
    name: z.string().min(1).max(30),
    tags: z.array(z.string().max(20)).max(5),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type JoinCoupleInput = z.infer<typeof joinCoupleSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type SendFlagInput = z.infer<typeof sendFlagSchema>;
export type SendLetterInput = z.infer<typeof sendLetterSchema>;
export type AddMemoryInput = z.infer<typeof addMemorySchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreateThemeInput = z.infer<typeof createThemeSchema>;
