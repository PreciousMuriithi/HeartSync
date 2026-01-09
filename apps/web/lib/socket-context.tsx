// HeartSync 2.0 - Socket Context
// Real-time connection for messages, typing, and notifications
// Made with 💕 for Precious & Safari

'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PartnerPresence {
    isOnline: boolean;
    isTyping: boolean;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    partnerPresence: PartnerPresence;
    emit: (event: string, data: any) => void;
    startTyping: () => void;
    stopTyping: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [partnerPresence, setPartnerPresence] = useState<PartnerPresence>({
        isOnline: false,
        isTyping: false,
    });

    useEffect(() => {
        const token = sessionStorage.getItem('heartsync_token');
        if (!token) {
            return;
        }

        // Create socket connection
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('🔌 Connected to HeartSync server');
            setIsConnected(true);

            // Authenticate
            newSocket.emit('auth', { token });
        });

        newSocket.on('auth:success', () => {
            console.log('✅ Authenticated with server');
        });

        newSocket.on('auth:error', (data) => {
            console.error('❌ Auth error:', data.message);
            setIsConnected(false);
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 Disconnected from server');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Connection error:', error.message);
            setIsConnected(false);
        });

        // Partner presence
        newSocket.on('partner:online', () => {
            setPartnerPresence(prev => ({ ...prev, isOnline: true }));
        });

        newSocket.on('partner:offline', () => {
            setPartnerPresence(prev => ({ ...prev, isOnline: false }));
        });

        newSocket.on('typing:partner', (data: { isTyping: boolean }) => {
            setPartnerPresence(prev => ({ ...prev, isTyping: data.isTyping }));
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Reconnect when token changes
    useEffect(() => {
        const handleStorageChange = () => {
            const token = sessionStorage.getItem('heartsync_token');
            if (token && socket && !isConnected) {
                socket.connect();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [socket, isConnected]);

    const emit = useCallback((event: string, data: any) => {
        if (socket && isConnected) {
            socket.emit(event, data);
        }
    }, [socket, isConnected]);

    const startTyping = useCallback(() => {
        const coupleData = sessionStorage.getItem('heartsync_couple');
        if (coupleData) {
            const couple = JSON.parse(coupleData);
            emit('typing:start', { coupleId: couple.id });
        }
    }, [emit]);

    const stopTyping = useCallback(() => {
        const coupleData = sessionStorage.getItem('heartsync_couple');
        if (coupleData) {
            const couple = JSON.parse(coupleData);
            emit('typing:stop', { coupleId: couple.id });
        }
    }, [emit]);

    return (
        <SocketContext.Provider value={{
            socket,
            isConnected,
            partnerPresence,
            emit,
            startTyping,
            stopTyping,
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
}
