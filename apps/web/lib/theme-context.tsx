// HeartSync 2.0 - Theme Context
// Made with 💕 for Precious & Safari

'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
    builtInThemes,
    defaultTheme,
    themeToCssVars,
    type ThemeConfig,
    type ThemeColors
} from '@heartsync/shared';

interface ThemeContextType {
    currentTheme: ThemeConfig;
    themes: ThemeConfig[];
    setTheme: (themeId: string) => void;
    addCustomTheme: (theme: ThemeConfig) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(defaultTheme);
    const [themes, setThemes] = useState<ThemeConfig[]>(builtInThemes);

    // Load saved theme on mount
    useEffect(() => {
        const savedThemeId = localStorage.getItem('heartsync_theme');
        const customThemes = localStorage.getItem('heartsync_custom_themes');

        if (customThemes) {
            setThemes([...builtInThemes, ...JSON.parse(customThemes)]);
        }

        if (savedThemeId) {
            const allThemes = customThemes
                ? [...builtInThemes, ...JSON.parse(customThemes)]
                : builtInThemes;
            const theme = allThemes.find(t => t.id === savedThemeId);
            if (theme) {
                setCurrentTheme(theme);
            }
        }
    }, []);

    // Apply theme CSS variables when theme changes
    useEffect(() => {
        const cssVars = themeToCssVars(currentTheme.colors);
        const root = document.documentElement;

        Object.entries(cssVars).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
    }, [currentTheme]);

    const setTheme = (themeId: string) => {
        const theme = themes.find(t => t.id === themeId);
        if (theme) {
            setCurrentTheme(theme);
            localStorage.setItem('heartsync_theme', themeId);
        }
    };

    const addCustomTheme = (theme: ThemeConfig) => {
        const customThemes = themes.filter(t => t.isCustom);
        const newCustomThemes = [...customThemes, theme];

        localStorage.setItem('heartsync_custom_themes', JSON.stringify(newCustomThemes));
        setThemes([...builtInThemes, ...newCustomThemes]);
    };

    return (
        <ThemeContext.Provider value={{
            currentTheme,
            themes,
            setTheme,
            addCustomTheme,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
