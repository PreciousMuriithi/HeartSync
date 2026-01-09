// HeartSync 2.0 - Theme System
// Made with 💕 for Precious & Safari
// 
// Default theme: Dark Romantic - Deep blacks with love heart red accents
// Designed for Precious (🧚💚🌸) & Safari (🖤⛓️🧛)

import type { ThemeConfig, ThemeColors } from './types';

// ============================================
// Color Palette - Dark Romantic
// ============================================

// Primary palette based on love heart emoji red: ❤️
// The heart red is approximately #E31B23 to #FF0000
// We use a softer, more romantic red: #E84057

const LOVE_RED = '#E84057';
const LOVE_RED_HOVER = '#FF5C72';
const LOVE_RED_DARK = '#C4354A';

// Dark romantic blacks with subtle warmth
const VOID_BLACK = '#0A0A0C';      // Deepest background
const MIDNIGHT = '#121215';         // Secondary background
const OBSIDIAN = '#1A1A1F';         // Surface
const CHARCOAL = '#252529';         // Surface hover
const SHADOW = '#35353A';           // Borders

// Accent colors that complement the emo + fairy aesthetic
const FAIRY_GREEN = '#7DD3A8';      // Precious's light green
const VAMPIRE_PURPLE = '#9B5DE5';   // Safari's emo purple
const ROSE_PINK = '#FF85A2';        // Romantic pink
const BLOSSOM = '#FFB5C5';          // Soft flower pink

// ============================================
// Default Theme: Dark Romantic
// ============================================

export const darkRomanticColors: ThemeColors = {
    // Core backgrounds
    background: VOID_BLACK,
    backgroundSecondary: MIDNIGHT,
    surface: OBSIDIAN,
    surfaceHover: CHARCOAL,

    // Accent colors
    primary: LOVE_RED,
    primaryHover: LOVE_RED_HOVER,
    secondary: VAMPIRE_PURPLE,
    accent: ROSE_PINK,

    // Text
    text: '#FAFAFA',
    textSecondary: '#B8B8BC',
    textMuted: '#6B6B70',

    // Chat bubbles - Precious sends fairy green tinted, Safari sends dark
    bubbleSent: LOVE_RED,            // Your messages - heart red
    bubbleSentText: '#FFFFFF',
    bubbleReceived: CHARCOAL,        // Their messages - dark with border
    bubbleReceivedText: '#FAFAFA',

    // Flags
    flagPositive: FAIRY_GREEN,       // Green for good vibes
    flagNegative: LOVE_RED_DARK,     // Dark red for concerns

    // Status
    success: FAIRY_GREEN,
    warning: '#FFB347',
    error: LOVE_RED,

    // Special accent colors
    hearts: LOVE_RED,                // ❤️ color
    trust: VAMPIRE_PURPLE,           // Purple for trust
    streak: '#FF9F43',               // Warm orange for streaks
};

export const darkRomanticTheme: ThemeConfig = {
    id: 'dark-romantic',
    name: 'Dark Romantic',
    isDark: true,
    colors: darkRomanticColors,
    isCustom: false,
};

// ============================================
// Alternative Theme: Midnight Garden
// A softer dark theme with more fairy/flower vibes
// ============================================

export const midnightGardenColors: ThemeColors = {
    background: '#0D1117',
    backgroundSecondary: '#161B22',
    surface: '#1C2128',
    surfaceHover: '#262C35',

    primary: ROSE_PINK,
    primaryHover: BLOSSOM,
    secondary: FAIRY_GREEN,
    accent: VAMPIRE_PURPLE,

    text: '#F0F6FC',
    textSecondary: '#8B949E',
    textMuted: '#6E7681',

    bubbleSent: ROSE_PINK,
    bubbleSentText: '#0D1117',
    bubbleReceived: '#262C35',
    bubbleReceivedText: '#F0F6FC',

    flagPositive: FAIRY_GREEN,
    flagNegative: '#F97583',

    success: FAIRY_GREEN,
    warning: '#FFB347',
    error: '#F97583',

    hearts: ROSE_PINK,
    trust: VAMPIRE_PURPLE,
    streak: '#FFB347',
};

export const midnightGardenTheme: ThemeConfig = {
    id: 'midnight-garden',
    name: 'Midnight Garden',
    isDark: true,
    colors: midnightGardenColors,
    isCustom: false,
};

// ============================================
// Alternative Theme: Vampire's Rose
// Deep purples and reds for Safari's emo aesthetic
// ============================================

export const vampiresRoseColors: ThemeColors = {
    background: '#0C0812',
    backgroundSecondary: '#13101A',
    surface: '#1A1522',
    surfaceHover: '#251E2E',

    primary: LOVE_RED,
    primaryHover: LOVE_RED_HOVER,
    secondary: '#9B5DE5',
    accent: '#7B2D8E',

    text: '#F5F0FA',
    textSecondary: '#A89BB8',
    textMuted: '#6A5A7A',

    bubbleSent: LOVE_RED,
    bubbleSentText: '#FFFFFF',
    bubbleReceived: '#251E2E',
    bubbleReceivedText: '#F5F0FA',

    flagPositive: '#9B5DE5',
    flagNegative: LOVE_RED_DARK,

    success: '#7DD3A8',
    warning: '#FFB347',
    error: LOVE_RED,

    hearts: LOVE_RED,
    trust: '#9B5DE5',
    streak: '#FFB347',
};

export const vampiresRoseTheme: ThemeConfig = {
    id: 'vampires-rose',
    name: 'Vampire\'s Rose',
    isDark: true,
    colors: vampiresRoseColors,
    isCustom: false,
};

// ============================================
// Light Theme: Fairy Garden
// For moments when dark is too dark
// ============================================

export const fairyGardenColors: ThemeColors = {
    background: '#FFFCF9',
    backgroundSecondary: '#FFF8F0',
    surface: '#FFFFFF',
    surfaceHover: '#FFF0E8',

    primary: LOVE_RED,
    primaryHover: LOVE_RED_HOVER,
    secondary: FAIRY_GREEN,
    accent: ROSE_PINK,

    text: '#1A1A1F',
    textSecondary: '#4A4A50',
    textMuted: '#8A8A90',

    bubbleSent: LOVE_RED,
    bubbleSentText: '#FFFFFF',
    bubbleReceived: '#F0F0F5',
    bubbleReceivedText: '#1A1A1F',

    flagPositive: '#4CAF50',
    flagNegative: LOVE_RED,

    success: '#4CAF50',
    warning: '#FF9800',
    error: LOVE_RED,

    hearts: LOVE_RED,
    trust: VAMPIRE_PURPLE,
    streak: '#FF9800',
};

export const fairyGardenTheme: ThemeConfig = {
    id: 'fairy-garden',
    name: 'Fairy Garden',
    isDark: false,
    colors: fairyGardenColors,
    isCustom: false,
};

// ============================================
// All Built-in Themes
// ============================================

export const builtInThemes: ThemeConfig[] = [
    darkRomanticTheme,    // Default
    midnightGardenTheme,
    vampiresRoseTheme,
    fairyGardenTheme,
];

export const defaultTheme = darkRomanticTheme;

// ============================================
// CSS Custom Properties Generator
// ============================================

export function themeToCssVars(colors: ThemeColors): Record<string, string> {
    return {
        '--color-background': colors.background,
        '--color-background-secondary': colors.backgroundSecondary,
        '--color-surface': colors.surface,
        '--color-surface-hover': colors.surfaceHover,
        '--color-primary': colors.primary,
        '--color-primary-hover': colors.primaryHover,
        '--color-secondary': colors.secondary,
        '--color-accent': colors.accent,
        '--color-text': colors.text,
        '--color-text-secondary': colors.textSecondary,
        '--color-text-muted': colors.textMuted,
        '--color-bubble-sent': colors.bubbleSent,
        '--color-bubble-sent-text': colors.bubbleSentText,
        '--color-bubble-received': colors.bubbleReceived,
        '--color-bubble-received-text': colors.bubbleReceivedText,
        '--color-flag-positive': colors.flagPositive,
        '--color-flag-negative': colors.flagNegative,
        '--color-success': colors.success,
        '--color-warning': colors.warning,
        '--color-error': colors.error,
        '--color-hearts': colors.hearts,
        '--color-trust': colors.trust,
        '--color-streak': colors.streak,
    };
}

// ============================================
// Theme Utilities
// ============================================

export function getContrastColor(hexColor: string): string {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function adjustBrightness(hexColor: string, percent: number): string {
    const num = parseInt(hexColor.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
