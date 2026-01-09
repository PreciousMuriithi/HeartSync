// HeartSync 2.0 - Auth Context
// Handles authentication, user data, and couple state
// Made with 💕 for Precious & Safari

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
    id: string;
    name: string;
    nickname: string;
    avatarEmojis: string[];
    publicKey: string;
    encryptedPrivateKey: string;
}

interface Partner {
    id: string;
    name: string;
    nickname: string;
    avatarEmojis: string[];
    publicKey: string;
}

interface Couple {
    id: string;
    hearts: number;
    trustScore: number;
    streak: number;
}

interface AuthContextType {
    isLoading: boolean;
    isAuthenticated: boolean;
    user: User | null;
    partner: Partner | null;
    couple: Couple | null;
    privateKey: string | null;
    login: (coupleCode: string, name: string, password: string) => Promise<{ success: boolean; error?: string }>;
    createCouple: (name: string, nickname: string, avatarEmojis: string[], password: string) => Promise<{ success: boolean; inviteCode?: string; error?: string }>;
    joinCouple: (inviteCode: string, name: string, nickname: string, avatarEmojis: string[], password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateCouple: (updates: Partial<Couple>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [partner, setPartner] = useState<Partner | null>(null);
    const [couple, setCouple] = useState<Couple | null>(null);
    const [privateKey, setPrivateKey] = useState<string | null>(null);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            const token = sessionStorage.getItem('heartsync_token');
            const savedUser = sessionStorage.getItem('heartsync_user');
            const savedPartner = sessionStorage.getItem('heartsync_partner');
            const savedCouple = sessionStorage.getItem('heartsync_couple');
            const savedPrivateKey = sessionStorage.getItem('heartsync_privateKey');

            if (token && savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                    setPartner(savedPartner ? JSON.parse(savedPartner) : null);
                    setCouple(savedCouple ? JSON.parse(savedCouple) : null);
                    setPrivateKey(savedPrivateKey || null);
                } catch (e) {
                    console.error('Error restoring session:', e);
                    sessionStorage.clear();
                }
            }
            setIsLoading(false);
        };

        checkSession();
    }, []);

    // Save session data
    const saveSession = (token: string, userData: User, partnerData: Partner | null, coupleData: Couple, encryptedPrivateKey: string) => {
        sessionStorage.setItem('heartsync_token', token);
        sessionStorage.setItem('heartsync_user', JSON.stringify(userData));
        sessionStorage.setItem('heartsync_partner', partnerData ? JSON.stringify(partnerData) : '');
        sessionStorage.setItem('heartsync_couple', JSON.stringify(coupleData));
        sessionStorage.setItem('heartsync_privateKey', encryptedPrivateKey);

        setUser(userData);
        setPartner(partnerData);
        setCouple(coupleData);
        setPrivateKey(encryptedPrivateKey);
    };

    // Login
    const login = async (coupleCode: string, name: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coupleCode, name, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Login failed' };
            }

            saveSession(data.token, data.user, data.partner, data.couple, data.user.encryptedPrivateKey);
            return { success: true };
        } catch (error: any) {
            console.error('Login error:', error);
            return { success: false, error: 'Connection failed. Is the server running?' };
        }
    };

    // Create new couple
    const createCouple = async (name: string, nickname: string, avatarEmojis: string[], password: string): Promise<{ success: boolean; inviteCode?: string; error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/api/auth/create-couple`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, nickname, avatarEmojis, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Failed to create couple' };
            }

            saveSession(data.token, data.user, null, data.couple, data.user.encryptedPrivateKey);
            return { success: true, inviteCode: data.inviteCode };
        } catch (error: any) {
            console.error('Create couple error:', error);
            return { success: false, error: 'Connection failed. Is the server running?' };
        }
    };

    // Join existing couple
    const joinCouple = async (inviteCode: string, name: string, nickname: string, avatarEmojis: string[], password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/api/auth/join-couple`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteCode, name, nickname, avatarEmojis, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Failed to join couple' };
            }

            saveSession(data.token, data.user, data.partner, data.couple, data.user.encryptedPrivateKey);
            return { success: true };
        } catch (error: any) {
            console.error('Join couple error:', error);
            return { success: false, error: 'Connection failed. Is the server running?' };
        }
    };

    // Logout
    const logout = useCallback(() => {
        sessionStorage.clear();
        setUser(null);
        setPartner(null);
        setCouple(null);
        setPrivateKey(null);
    }, []);

    // Update couple data
    const updateCouple = useCallback((updates: Partial<Couple>) => {
        setCouple(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            sessionStorage.setItem('heartsync_couple', JSON.stringify(updated));
            return updated;
        });
    }, []);

    return (
        <AuthContext.Provider value={{
            isLoading,
            isAuthenticated: !!user,
            user,
            partner,
            couple,
            privateKey,
            login,
            createCouple,
            joinCouple,
            logout,
            updateCouple,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
